import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService } from '../services/settings.service';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get theme from user settings first
    const fetchUserTheme = async () => {
      try {
        const userSettings = await settingsService.getUserSettings();
        if (userSettings.theme) {
          setTheme(userSettings.theme);
        } else {
          // Fallback to localStorage if no settings found
          const savedTheme = localStorage.getItem('theme') as Theme;
          if (savedTheme) {
            setTheme(savedTheme);
          }
        }
      } catch (error) {
        // If API call fails, check localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTheme();
  }, []);

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage as fallback
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save theme to user settings
  const saveThemeToSettings = async (newTheme: Theme) => {
    try {
      await settingsService.updateUserSettings({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme to settings:', error);
    }
  };

  const setThemeWithSave = (newTheme: Theme) => {
    setTheme(newTheme);
    saveThemeToSettings(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveThemeToSettings(newTheme);
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme: setThemeWithSave, 
        toggleTheme, 
        isLoading 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 