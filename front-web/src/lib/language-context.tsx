import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settings.service';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import '../i18n'; // Import our i18n configuration
import { authService } from '../services/auth.service';

// Define more detailed language type for RTL support
export type Language = 'english' | 'french' | 'arabic' | 'spanish';
export type LanguageCode = 'en' | 'fr' | 'ar' | 'es';
export type TextDirection = 'ltr' | 'rtl';

// Map language names to ISO codes 
export const languageToCode: Record<Language, LanguageCode> = {
  english: 'en',
  french: 'fr',
  arabic: 'ar',
  spanish: 'es'
};

// Map language codes to names
export const codeToLanguage: Record<LanguageCode, Language> = {
  en: 'english',
  fr: 'french',
  ar: 'arabic',
  es: 'spanish'
};

// Define RTL languages
export const rtlLanguages: LanguageCode[] = ['ar']; 

// Utility function to check if a language is RTL
export const isRTLLanguage = (language: Language | LanguageCode): boolean => {
  const code = typeof language === 'string' && language.length === 2 
    ? language as LanguageCode
    : languageToCode[language as Language];
  return rtlLanguages.includes(code);
};

// Utility function to get document direction based on language
export const getLanguageDirection = (language: Language | LanguageCode): TextDirection => {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
};

// IMPROVED: Smoother direction style application without full reflows
export const applyDirectionStyles = (dir: TextDirection): void => {
  // Store current scroll position
  const scrollPos = window.scrollY;
  
  // Only reset transformations if needed
  if (document.documentElement.dir !== dir) {
    // Apply direction to the HTML element
    document.documentElement.dir = dir;
    document.documentElement.className = dir === 'rtl' ? 'rtl' : 'ltr';
    
    // Handle sidebar transitions smoothly
    const allSidebars = document.querySelectorAll('aside');
    allSidebars.forEach(sidebar => {
      // Remove transition temporarily for instant repositioning
      const originalTransition = sidebar.style.transition;
      sidebar.style.transition = 'none';
      
      // Reset transforms
      sidebar.classList.remove('-translate-x-full', 'translate-x-full');
      sidebar.style.removeProperty('transform');
      
      // Force reflow but only for the sidebar
      void sidebar.offsetHeight;
      
      // Restore transition
      setTimeout(() => {
        sidebar.style.transition = originalTransition;
      }, 10);
    });
    
    // Minimal partial reflow instead of hiding the entire body
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 10);
    
    // Restore scroll position
    window.scrollTo(0, scrollPos);
    
    // Dispatch an event to notify components about direction change
    window.dispatchEvent(new CustomEvent('directionchange', { 
      detail: { direction: dir } 
    }));
  }
};

interface LanguageContextType {
  language: Language;
  languageCode: LanguageCode;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
  t: (key: string, options?: any) => string; // Translation function
  getDirection: () => TextDirection; // Get current text direction
  toggleDirection: () => void; // Toggle direction (for testing purposes)
  forceUpdate: number; // Force re-render timestamp
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('english');
  const [isLoading, setIsLoading] = useState(true);
  // Add forceUpdate state to trigger re-renders when language changes
  const [forceUpdate, setForceUpdate] = useState(Date.now());
  const { t } = useTranslation();
  // Add a state to track if API calls have been attempted
  const [apiCallAttempted, setApiCallAttempted] = useState(false);

  // Compute language code and RTL status
  const languageCode = languageToCode[language];
  const isRTL = rtlLanguages.includes(languageCode);

  // Get current direction
  const getDirection = (): TextDirection => {
    return isRTL ? 'rtl' : 'ltr';
  };

  // Toggle direction (useful for testing)
  const toggleDirection = (): void => {
    const newDir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl';
    applyDirectionStyles(newDir);
    setForceUpdate(prev => prev + 1);
  };

  // Initial language setup - only runs once
  useEffect(() => {
    // Try to get language from user settings first, but only if authenticated
    const fetchUserLanguage = async () => {
      try {
        // First, check if we're authenticated to avoid 401 errors
        const token = authService.getToken();
        if (!token) {
          // Not authenticated - use localStorage and exit early
          const savedLanguage = localStorage.getItem('language') as Language;
          if (savedLanguage && Object.keys(languageToCode).includes(savedLanguage)) {
            setLanguageState(savedLanguage);
          }
          setIsLoading(false);
          setApiCallAttempted(true);
          return;
        }
        
        // Check if token is expired
        const isExpired = authService.isTokenExpired(token);
        if (isExpired) {
          // Token expired - use localStorage and exit early
          const savedLanguage = localStorage.getItem('language') as Language;
          if (savedLanguage && Object.keys(languageToCode).includes(savedLanguage)) {
            setLanguageState(savedLanguage);
          }
          setIsLoading(false);
          setApiCallAttempted(true);
          return;
        }
        
        // We have a valid token, try to get user settings
        try {
          const userSettings = await settingsService.getUserSettings();
          if (userSettings?.language) {
            setLanguageState(userSettings.language);
          } else {
            // No language in settings, fall back to localStorage
            const savedLanguage = localStorage.getItem('language') as Language;
            if (savedLanguage && Object.keys(languageToCode).includes(savedLanguage)) {
              setLanguageState(savedLanguage);
            }
          }
        } catch (error) {
          console.log('Could not load user settings, falling back to localStorage');
          // API call failed, fall back to localStorage
          const savedLanguage = localStorage.getItem('language') as Language;
          if (savedLanguage && Object.keys(languageToCode).includes(savedLanguage)) {
            setLanguageState(savedLanguage);
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        // If all fails, we'll just use the default language
        
        // Try localStorage as last resort
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && Object.keys(languageToCode).includes(savedLanguage)) {
          setLanguageState(savedLanguage);
        }
      } finally {
        setIsLoading(false);
        setApiCallAttempted(true);
      }
    };

    fetchUserLanguage();
  }, []); // Empty dependency array ensures this only runs once

  // Add an effect to listen for i18next language changes
  useEffect(() => {
    const handleLanguageChanged = () => {
      // Use a more minimal update approach
      setForceUpdate(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Update i18next and document attributes when language changes
  useEffect(() => {
    if (!isLoading) {
      const code = languageToCode[language];
      const dir = getLanguageDirection(code);
      
      // Change i18next language
      i18n.changeLanguage(code).then(() => {
        // Apply direction changes in a smoother way
        applyDirectionStyles(dir);
        // Minimal update to trigger only necessary re-renders
        setForceUpdate(prev => prev + 1);
      });
      
      // Update HTML attributes
      document.documentElement.lang = code;
      
      // Set data attribute for easier CSS selectors
      document.documentElement.setAttribute('data-language', code);
      
      // Store in localStorage
      localStorage.setItem('language', language);
    }
  }, [language, isLoading]);

  // Save language to user settings
  const saveLanguageToSettings = async (newLanguage: Language) => {
    // Check if we're authenticated first
    const token = authService.getToken();
    if (!token) {
      // Not authenticated, just save to localStorage
      localStorage.setItem('language', newLanguage);
      return;
    }
    
    // Check if token is expired
    const isExpired = authService.isTokenExpired(token);
    if (isExpired) {
      // Token expired, just save to localStorage
      localStorage.setItem('language', newLanguage);
      return;
    }
    
    // Only attempt to save settings if authenticated and we've already tried API calls
    if (apiCallAttempted) {
      try {
        await settingsService.updateUserSettings({ language: newLanguage });
      } catch (error) {
        console.error('Failed to save language to settings:', error);
        // Still save to localStorage even if API fails
        localStorage.setItem('language', newLanguage);
      }
    } else {
      // Not yet attempted API calls, just save to localStorage
      localStorage.setItem('language', newLanguage);
    }
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    saveLanguageToSettings(newLanguage);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        languageCode,
        isRTL,
        setLanguage, 
        isLoading,
        t,
        getDirection,
        toggleDirection,
        forceUpdate
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 