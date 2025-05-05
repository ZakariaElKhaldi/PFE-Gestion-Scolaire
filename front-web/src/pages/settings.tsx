import { useState, useEffect } from 'react'
import { DashboardLayout } from '../components/dashboard/layout/dashboard-layout'
import { User } from '../types/auth'
import { toast, Toaster } from 'react-hot-toast'
import { BellIcon, MoonIcon, SunIcon, MailIcon, SmartphoneIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import { UserSettings } from '../types/settings'
import { settingsService } from '../services/settings.service'
import { useTheme } from '../lib/theme-context'
import { useLanguage } from '../lib/language-context'

interface SettingsPageProps {
  user: User
}

const SettingsPage = ({ user }: SettingsPageProps) => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<UserSettings>({
    userId: user.id,
    theme: theme as 'light' | 'dark',
    language: language,
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    weekStartsOn: 'monday',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Fetch user settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const userSettings = await settingsService.getUserSettings()
        setSettings(userSettings)
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsFetching(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await settingsService.updateUserSettings(settings)
      // Update the theme in the theme context
      if (settings.theme !== theme) {
        setTheme(settings.theme)
      }
      // Update the language in the language context
      if (settings.language !== language) {
        setLanguage(settings.language)
      }
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (field: keyof UserSettings) => {
    setSettings(prev => {
      if (typeof prev[field] === 'boolean') {
        return { ...prev, [field]: !prev[field] }
      }
      return prev
    })
  }

  const handleChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (isFetching) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <Toaster />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account settings and preferences.
              </p>
            </div>

            <div className="space-y-8">
              {/* Theme Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Theme</h3>
                <div className="mt-4 flex items-center space-x-4">
                  <button
                    onClick={() => handleChange('theme', 'light')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      settings.theme === 'light'
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-700'
                    }`}
                  >
                    <SunIcon className="h-5 w-5 mr-2" />
                    Light
                  </button>
                  <button
                    onClick={() => handleChange('theme', 'dark')}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      settings.theme === 'dark'
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-700'
                    }`}
                  >
                    <MoonIcon className="h-5 w-5 mr-2" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">Enable all notifications</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('notifications')}
                      className={`${
                        settings.notifications ? 'bg-primary' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                      role="switch"
                      aria-checked={settings.notifications}
                    >
                      <span
                        className={`${
                          settings.notifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MailIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">Email notifications</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('emailNotifications')}
                      className={`${
                        settings.emailNotifications ? 'bg-primary' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                      role="switch"
                      aria-checked={settings.emailNotifications}
                    >
                      <span
                        className={`${
                          settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <SmartphoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">SMS notifications</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('smsNotifications')}
                      className={`${
                        settings.smsNotifications ? 'bg-primary' : 'bg-gray-200'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                      role="switch"
                      aria-checked={settings.smsNotifications}
                    >
                      <span
                        className={`${
                          settings.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Format Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Date & Time</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="flex items-center text-sm text-gray-700 mb-1">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Week starts on
                    </label>
                    <select
                      value={settings.weekStartsOn}
                      onChange={(e) => handleChange('weekStartsOn', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm text-gray-700 mb-1">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Date format
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => handleChange('dateFormat', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm text-gray-700 mb-1">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Time format
                    </label>
                    <select
                      value={settings.timeFormat}
                      onChange={(e) => handleChange('timeFormat', e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="12h">12 hour (1:30 PM)</option>
                      <option value="24h">24 hour (13:30)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Language Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Language</h3>
                <div className="mt-4">
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                  >
                    <option value="english">English</option>
                    <option value="french">French</option>
                    <option value="arabic">Arabic</option>
                    <option value="spanish">Spanish</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage
