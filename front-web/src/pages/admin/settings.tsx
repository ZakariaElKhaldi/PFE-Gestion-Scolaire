import { useState } from 'react'
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout'
import { UserResponse } from '../../types/auth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { RotateCcw, Save, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'

// Import types
import { 
  SystemSettings,
  NotificationSettings, 
  SecuritySettings,
  FeatureFlags,
  ResourceLimits
} from '../../types/settings'

// Import our extracted components
import {
  SystemStatusCard,
  BackupDialog,
  ResetSettingsDialog,
  GeneralSettingsTab,
  SecuritySettingsTab,
  NotificationsTab,
  SystemSettingsTab
} from '../../components/admin'

interface SettingsPageProps {
  user: UserResponse
}

export const SettingsPage = ({ user }: SettingsPageProps) => {
  // Tab state
  const [activeTab, setActiveTab] = useState('general')
  
  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    id: 1,
    schoolName: 'Academic Excellence Academy',
    academicYear: '2023-2024',
    timezone: 'UTC+1',
    contactEmail: 'admin@academy.edu',
    contactPhone: '+1234567890',
    address: '123 Education St, Knowledge City',
    enableParentPortal: true,
    enableStudentPortal: true,
    enableTeacherPortal: true,
    maintenanceMode: false,
    updatedBy: '',
    updatedAt: new Date().toISOString(),
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    notifyOnNewStudent: true,
    notifyOnAbsence: true,
    notifyOnGrades: true,
    notifyOnEvents: true,
    dailyDigest: false
  })

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    id: 1,
    requireTwoFactor: false,
    passwordExpiryDays: 90,
    sessionTimeout: 30,
    allowedIpRanges: '192.168.1.1/24, 10.0.0.1/16',
    maxLoginAttempts: 5,
    updatedBy: '',
    updatedAt: new Date().toISOString(),
  })

  // Feature flags state
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    onlineExams: true,
    virtualClassrooms: true,
    parentPortal: true,
    mobileApp: false,
    apiAccess: true,
    analytics: true,
    autoGrading: false,
    librarySystem: true,
    attendanceTracking: true,
    homeworkSubmission: true
  })

  // Resource limits state
  const [resourceLimits, setResourceLimits] = useState<ResourceLimits>({
    maxFileUploadSize: 50, // MB
    maxStoragePerUser: 1000, // MB
    maxConcurrentUsers: 500,
    maxVideoLength: 60, // minutes
    maxBandwidthPerUser: 5, // Mbps
    maxClassesPerTeacher: 6
  })

  // Additional state 
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [dataBackup, setDataBackup] = useState(true)
  const [enableRegistration, setEnableRegistration] = useState(true)
  const [languagePreference, setLanguagePreference] = useState('english')
  const [theme, setTheme] = useState('light')
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Handler functions
  const handleSystemSettingChange = (
    key: keyof SystemSettings,
    value: string | number | boolean
  ) => {
    setSystemSettings({
      ...systemSettings,
      [key]: value,
    })
  }

  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings((prev: NotificationSettings) => ({ ...prev, [key]: value }))
  }

  const handleSecuritySettingChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings((prev: SecuritySettings) => ({ ...prev, [key]: value }))
  }

  const handleFeatureFlagChange = (key: keyof FeatureFlags) => {
    setFeatureFlags((prev: FeatureFlags) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleResourceLimitChange = (key: keyof ResourceLimits, value: number) => {
    setResourceLimits((prev: ResourceLimits) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  const handleBackup = () => {
    // Handle backup logic
    setShowBackupDialog(false)
  }

  const handleReset = () => {
    // Handle reset logic
    setShowResetDialog(false)
  }

  // System metrics for display
  const systemMetrics = {
    cpuUsage: '32%',
    memoryUsage: '48%',
    diskUsage: '62%',
    activeUsers: 327,
    uptime: '23 days, 7 hours',
    lastBackup: '2023-11-28 03:45 AM',
    databaseSize: '1.8 GB',
  }

  // Enhanced tabs with more options
  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'security', name: 'Security & Privacy' },
    { id: 'integrations', name: 'Integrations' },
    { id: 'system', name: 'System' },
    { id: 'advanced', name: 'Advanced' }
  ]

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your system settings, notifications, and security preferences.
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Logged in as: {user.firstName} {user.lastName}
          </div>
        </div>

        {systemSettings.maintenanceMode && (
          <Alert className="bg-amber-50 border-amber-200 mb-6">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">Maintenance Mode Enabled</AlertTitle>
            <AlertDescription className="text-amber-700">
              The system is currently in maintenance mode. Only administrators can access the platform.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* System Status Card */}
          <div className="md:col-span-1">
            <SystemStatusCard 
              cpuUsage={systemMetrics.cpuUsage}
              memoryUsage={systemMetrics.memoryUsage}
              diskUsage={systemMetrics.diskUsage}
              activeUsers={systemMetrics.activeUsers}
              uptime={systemMetrics.uptime}
              lastBackup={systemMetrics.lastBackup}
              databaseSize={systemMetrics.databaseSize}
              onBackupClick={() => setShowBackupDialog(true)}
            />
          </div>
          
          {/* Main Settings Tabs */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Settings</CardTitle>
                <CardDescription>Manage system-wide configurations and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4 grid grid-cols-6 gap-2">
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>{tab.name}</TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* General Settings Tab */}
                  <TabsContent value="general">
                    <GeneralSettingsTab 
                      systemSettings={systemSettings}
                      handleSystemSettingChange={handleSystemSettingChange}
                      languagePreference={languagePreference}
                      setLanguagePreference={setLanguagePreference}
                      theme={theme}
                      setTheme={setTheme}
                    />
                  </TabsContent>
                  
                  {/* Notifications Tab */}
                  <TabsContent value="notifications">
                    <NotificationsTab 
                      notificationSettings={notificationSettings}
                      handleNotificationSettingChange={handleNotificationSettingChange}
                      smsNotifications={smsNotifications}
                      setSmsNotifications={setSmsNotifications}
                    />
                  </TabsContent>
                  
                  {/* Security Tab */}
                  <TabsContent value="security">
                    <SecuritySettingsTab 
                      securitySettings={securitySettings}
                      handleSecuritySettingChange={handleSecuritySettingChange}
                      enableRegistration={enableRegistration}
                      setEnableRegistration={setEnableRegistration}
                    />
                  </TabsContent>
                  
                  {/* Integrations Tab */}
                  <TabsContent value="integrations" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-medium">Google Workspace</p>
                          <div className="text-sm text-muted-foreground">
                            Integration with Google services
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-medium">Microsoft 365</p>
                          <div className="text-sm text-muted-foreground">
                            Integration with Microsoft services
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-medium">Payment Gateway</p>
                          <div className="text-sm text-muted-foreground">
                            Online payment processing integration
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-medium">Learning Management System</p>
                          <div className="text-sm text-muted-foreground">
                            Integration with external LMS
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* System Tab */}
                  <TabsContent value="system">
                    <SystemSettingsTab 
                      featureFlags={featureFlags}
                      handleFeatureFlagChange={handleFeatureFlagChange}
                      resourceLimits={resourceLimits}
                      handleResourceLimitChange={handleResourceLimitChange}
                    />
                  </TabsContent>
                  
                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-medium">Automated Backups</p>
                          <div className="text-sm text-muted-foreground">
                            Schedule regular system backups
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant={dataBackup ? "default" : "outline"}
                            onClick={() => setDataBackup(true)}
                          >
                            Enabled
                          </Button>
                          <Button 
                            variant={!dataBackup ? "default" : "outline"}
                            onClick={() => setDataBackup(false)}
                          >
                            Disabled
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-red-600">Reset System Settings</p>
                          <div className="text-sm text-red-500">
                            Reset all settings to default values
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => setShowResetDialog(true)}>
                          Reset to Default
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <BackupDialog 
          open={showBackupDialog} 
          onOpenChange={setShowBackupDialog} 
          onBackup={handleBackup} 
        />
        
        <ResetSettingsDialog 
          open={showResetDialog} 
          onOpenChange={setShowResetDialog} 
          onReset={handleReset} 
        />
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage