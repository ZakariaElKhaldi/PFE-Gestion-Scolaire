import { useState, useEffect } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { cn } from '../../lib/utils'
import { useLanguage, codeToLanguage, languageToCode, LanguageCode } from '../../lib/language-context'

export type Language = {
  code: string
  name: string
  dir: 'ltr' | 'rtl'
}

const languages: Language[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
]

interface LanguageSelectorProps {
  className?: string
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  // Use our language context
  const { language: currentLang, setLanguage } = useLanguage()
  const [currentLanguage, setCurrentLanguage] = useState<Language>()

  // Initialize from context
  useEffect(() => {
    const langCode = languageToCode[currentLang]
    const lang = languages.find(l => l.code === langCode)
    if (lang) {
      setCurrentLanguage(lang)
    }
  }, [currentLang])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    
    // Use our context to change language
    // Only use language codes that we know are in our codeToLanguage mapping
    if (language.code === 'en' || language.code === 'fr' || language.code === 'ar' || language.code === 'es') {
      const langCode = language.code as LanguageCode;
      const langName = codeToLanguage[langCode]
      setLanguage(langName)
    }
  }

  if (!currentLanguage) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("flex items-center gap-1 px-2", className)}>
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline-block ml-1">{currentLanguage.name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="flex items-center gap-2"
          >
            <span>{language.name}</span>
            {currentLanguage.code === language.code && (
              <Check className="h-4 w-4 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSelector 