import { useState } from 'react'
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout'
import { UserResponse } from '../../../types/auth'
import { SystemSettings, NotificationSettings, SecuritySettings, SystemMonitoring, FeatureFlags, ResourceLimits } from '../../../types/settings'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '../../../components/ui/separator'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { Textarea } from '../../../components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { 
  AlertTriangle, 
  Check, 
  Database, 
  Globe, 
  HardDrive, 
  Lock, 
  Mail, 
  RotateCcw, 
  Save, 
  Server, 
  Settings, 
  Shield, 
  Users, 
  BellRing, 
  Zap,
  Info
} from 'lucide-react'

interface SettingsPageProps {
  user: UserResponse
}

export const SettingsPage = ({ user }: SettingsPageProps) => {
  // Tab state
  const [activeTab, setActiveTab] = useState('general')
  
  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    schoolName: 'International Academy',
    academicYear: '2024-2025',
    timezone: 'UTC+1',
    emailNotifications: true,
    defaultLanguage: 'English',
    maintenanceMode: false,
    maxStudentsPerClass: 30,
    gradingSystem: 'percentage'
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
    requireTwoFactor: false,
    passwordExpiryDays: 90,
    sessionTimeout: 30,
    allowedIpRanges: ['*'],
    maxLoginAttempts: 5
  })

  // System monitoring state
  const [systemMonitoring, setSystemMonitoring] = useState<SystemMonitoring>({
    cpu: { usage: 45, cores: 8, temperature: 65 },
    memory: { total: 32000, used: 16000, free: 16000 },
    storage: { total: 1000000, used: 400000, free: 600000 },
    uptime: 1209600, // 14 days in seconds
    lastBackup: '2025-02-14T12:00:00Z',
    activeUsers: 245
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

  // Additional state from system-settings
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [dataBackup, setDataBackup] = useState(true)
  const [enableRegistration, setEnableRegistration] = useState(true)
  const [languagePreference, setLanguagePreference] = useState('english')
  const [theme, setTheme] = useState('light')
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Handler functions
  const handleSystemSettingChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleNotificationSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSecuritySettingChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
  }

  const handleFeatureFlagChange = (key: keyof FeatureFlags) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleResourceLimitChange = (key: keyof ResourceLimits, value: number) => {
    setResourceLimits(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
    }, 1500)
  }

  // Utility functions
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
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
          {/* System Status Card - Always visible */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">{systemMetrics.cpuUsage}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: systemMetrics.cpuUsage }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">{systemMetrics.memoryUsage}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: systemMetrics.memoryUsage }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm font-medium">{systemMetrics.diskUsage}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: systemMetrics.diskUsage }}></div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users</span>
                    <Badge variant="outline">{systemMetrics.activeUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="outline">{systemMetrics.uptime}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <Badge variant="outline">{systemMetrics.lastBackup}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Size</span>
                    <Badge variant="outline">{systemMetrics.databaseSize}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" onClick={() => setShowBackupDialog(true)}>
                  <HardDrive className="h-4 w-4 mr-2" />
                  Backup System
                </Button>
              </CardFooter>
            </Card>
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
                  <TabsContent value="general" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="schoolName">School Name</Label>
                          <div className="text-sm text-muted-foreground">
                            The name of your educational institution
                          </div>
                        </div>
                        <Input 
                          id="schoolName" 
                          className="w-[250px]" 
                          value={systemSettings.schoolName}
                          onChange={(e) => handleSystemSettingChange('schoolName', e.target.value)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="academicYear">Academic Year</Label>
                          <div className="text-sm text-muted-foreground">
                            Current academic year
                          </div>
                        </div>
                        <Input 
                          id="academicYear" 
                          className="w-[250px]" 
                          value={systemSettings.academicYear}
                          onChange={(e) => handleSystemSettingChange('academicYear', e.target.value)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="timezone-select">Time Zone</Label>
                          <div className="text-sm text-muted-foreground">
                            System-wide time zone setting
                          </div>
                        </div>
                        <Select value={systemSettings.timezone} onValueChange={(value) => handleSystemSettingChange('timezone', value)}>
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC+1">UTC+1</SelectItem>
                            <SelectItem value="UTC+2">UTC+2</SelectItem>
                            <SelectItem value="UTC+3">UTC+3</SelectItem>
                            <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                            <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                            <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                            <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="language-select">Default Language</Label>
                          <div className="text-sm text-muted-foreground">
                            Default system language
                          </div>
                        </div>
                        <Select value={languagePreference} onValueChange={setLanguagePreference}>
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="arabic">Arabic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maxStudents">Maximum Students per Class</Label>
                          <div className="text-sm text-muted-foreground">
                            Limit the number of students per class
                          </div>
                        </div>
                        <Input 
                          id="maxStudents" 
                          type="number"
                          className="w-[250px]" 
                          value={systemSettings.maxStudentsPerClass}
                          onChange={(e) => handleSystemSettingChange('maxStudentsPerClass', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="gradingSystem">Grading System</Label>
                          <div className="text-sm text-muted-foreground">
                            System for evaluating student performance
                          </div>
                        </div>
                        <Select value={systemSettings.gradingSystem} onValueChange={(value: any) => handleSystemSettingChange('gradingSystem', value)}>
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select grading system" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="letter">Letter Grade</SelectItem>
                            <SelectItem value="points">Points</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Maintenance Mode</Label>
                          <div className="text-sm text-muted-foreground">
                            Enable for system maintenance (restricts access to admins only)
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={systemSettings.maintenanceMode}
                            onCheckedChange={(checked) => handleSystemSettingChange('maintenanceMode', checked)}
                          />
                          <Label>{systemSettings.maintenanceMode ? "Enabled" : "Disabled"}</Label>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme-select">System Theme</Label>
                          <div className="text-sm text-muted-foreground">
                            Default appearance theme
                          </div>
                        </div>
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(notificationSettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                            <div className="text-sm text-muted-foreground">
                              {key === 'emailNotifications' && 'Send notifications via email'}
                              {key === 'pushNotifications' && 'Send push notifications to devices'}
                              {key === 'notifyOnNewStudent' && 'Get notified when new students register'}
                              {key === 'notifyOnAbsence' && 'Get notified about student absences'}
                              {key === 'notifyOnGrades' && 'Get notified when grades are posted'}
                              {key === 'notifyOnEvents' && 'Get notified about upcoming events'}
                              {key === 'dailyDigest' && 'Receive a daily summary of activities'}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={value}
                              onCheckedChange={(checked) => handleNotificationSettingChange(key as keyof NotificationSettings, checked)}
                            />
                            <Label>{value ? "Enabled" : "Disabled"}</Label>
                          </div>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <div className="text-sm text-muted-foreground">
                            Send system notifications via SMS
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={smsNotifications}
                            onCheckedChange={setSmsNotifications}
                          />
                          <Label>{smsNotifications ? "Enabled" : "Disabled"}</Label>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="smtp-server">SMTP Server</Label>
                          <div className="text-sm text-muted-foreground">
                            Email server configuration
                          </div>
                        </div>
                        <Input id="smtp-server" className="w-[250px]" defaultValue="smtp.academy.edu" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="smtp-port">SMTP Port</Label>
                          <div className="text-sm text-muted-foreground">
                            Email server port
                          </div>
                        </div>
                        <Input id="smtp-port" className="w-[250px]" defaultValue="587" type="number" />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notif-frequency">Notification Frequency</Label>
                          <div className="text-sm text-muted-foreground">
                            How often to send digests and summaries
                          </div>
                        </div>
                        <Select defaultValue="daily">
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Security Tab */}
                  <TabsContent value="security" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <div className="text-sm text-muted-foreground">
                            Require two-factor authentication for all users
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={securitySettings.requireTwoFactor}
                            onCheckedChange={(checked) => handleSecuritySettingChange('requireTwoFactor', checked)}
                          />
                          <Label>{securitySettings.requireTwoFactor ? "Required" : "Optional"}</Label>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>User Registration</Label>
                          <div className="text-sm text-muted-foreground">
                            Allow new user registrations
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={enableRegistration}
                            onCheckedChange={setEnableRegistration}
                          />
                          <Label>{enableRegistration ? "Enabled" : "Disabled"}</Label>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                          <div className="text-sm text-muted-foreground">
                            Days before passwords must be changed
                          </div>
                        </div>
                        <Input 
                          id="passwordExpiry" 
                          type="number"
                          className="w-[250px]" 
                          value={securitySettings.passwordExpiryDays}
                          onChange={(e) => handleSecuritySettingChange('passwordExpiryDays', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <div className="text-sm text-muted-foreground">
                            Automatically log users out after inactivity
                          </div>
                        </div>
                        <Input 
                          id="sessionTimeout" 
                          type="number"
                          className="w-[250px]" 
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                          <div className="text-sm text-muted-foreground">
                            Number of failed attempts before account lockout
                          </div>
                        </div>
                        <Input 
                          id="maxLoginAttempts" 
                          type="number"
                          className="w-[250px]" 
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="password-policy">Password Policy</Label>
                          <div className="text-sm text-muted-foreground">
                            Minimum security requirements for passwords
                          </div>
                        </div>
                        <Select defaultValue="strong">
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                            <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                            <SelectItem value="strong">Strong (8+ chars, mixed case, numbers)</SelectItem>
                            <SelectItem value="very-strong">Very Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Integrations Tab */}
                  <TabsContent value="integrations" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Google Workspace</Label>
                          <div className="text-sm text-muted-foreground">
                            Integration with Google services
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Microsoft 365</Label>
                          <div className="text-sm text-muted-foreground">
                            Integration with Microsoft services
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Payment Gateway</Label>
                          <div className="text-sm text-muted-foreground">
                            Online payment processing integration
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Learning Management System</Label>
                          <div className="text-sm text-muted-foreground">
                            Integration with external LMS
                          </div>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>API Access</Label>
                          <div className="text-sm text-muted-foreground">
                            Enable external API access
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={featureFlags.apiAccess}
                            onCheckedChange={() => handleFeatureFlagChange('apiAccess')}
                          />
                          <Label>{featureFlags.apiAccess ? "Enabled" : "Disabled"}</Label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* System Tab */}
                  <TabsContent value="system" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Feature Toggles</h3>
                      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                        {Object.entries(featureFlags).map(([key, value]) => (
                          <div key={key} className="p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-base font-medium text-gray-900">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={value}
                                onCheckedChange={() => handleFeatureFlagChange(key as keyof FeatureFlags)}
                              />
                              <Label>{value ? "Enabled" : "Disabled"}</Label>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-medium mt-6">Resource Limits</h3>
                      <div className="bg-white shadow rounded-lg p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label className="block text-sm font-medium">Max File Upload Size (MB)</Label>
                            <Input
                              type="number"
                              value={resourceLimits.maxFileUploadSize}
                              onChange={(e) => handleResourceLimitChange('maxFileUploadSize', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="block text-sm font-medium">Storage per User (MB)</Label>
                            <Input
                              type="number"
                              value={resourceLimits.maxStoragePerUser}
                              onChange={(e) => handleResourceLimitChange('maxStoragePerUser', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="block text-sm font-medium">Max Concurrent Users</Label>
                            <Input
                              type="number"
                              value={resourceLimits.maxConcurrentUsers}
                              onChange={(e) => handleResourceLimitChange('maxConcurrentUsers', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="block text-sm font-medium">Max Video Length (minutes)</Label>
                            <Input
                              type="number"
                              value={resourceLimits.maxVideoLength}
                              onChange={(e) => handleResourceLimitChange('maxVideoLength', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="block text-sm font-medium">Bandwidth per User (Mbps)</Label>
                            <Input
                              type="number"
                              value={resourceLimits.maxBandwidthPerUser}
                              onChange={(e) => handleResourceLimitChange('maxBandwidthPerUser', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="block text-sm font-medium">Classes per Teacher</Label>
                            <Input
                              type="number"
                              value={resourceLimits.maxClassesPerTeacher}
                              onChange={(e) => handleResourceLimitChange('maxClassesPerTeacher', parseInt(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-medium mt-6">System Monitoring</h3>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {/* CPU Stats */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <Server className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">CPU Usage</dt>
                                  <dd className="flex items-baseline">
                                    <div className="flex items-center text-2xl font-semibold text-gray-900">
                                      {systemMonitoring.cpu.usage}%
                                    </div>
                                  </dd>
                                </dl>
                                <div className="text-sm text-gray-500 mt-2">
                                  {systemMonitoring.cpu.cores} Cores • {systemMonitoring.cpu.temperature}°C
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Memory Stats */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <Database className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">Memory Usage</dt>
                                  <dd className="flex items-baseline">
                                    <div className="flex items-center text-2xl font-semibold text-gray-900">
                                      {formatBytes(systemMonitoring.memory.used)} / {formatBytes(systemMonitoring.memory.total)}
                                    </div>
                                  </dd>
                                </dl>
                                <div className="text-sm text-gray-500 mt-2">
                                  {formatBytes(systemMonitoring.memory.free)} Available
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Storage Stats */}
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                          <div className="p-5">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <HardDrive className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-5 w-0 flex-1">
                                <dl>
                                  <dt className="text-sm font-medium text-gray-500 truncate">Storage</dt>
                                  <dd className="flex items-baseline">
                                    <div className="flex items-center text-2xl font-semibold text-gray-900">
                                      {formatBytes(systemMonitoring.storage.used)} / {formatBytes(systemMonitoring.storage.total)}
                                    </div>
                                  </dd>
                                </dl>
                                <div className="text-sm text-gray-500 mt-2">
                                  {formatBytes(systemMonitoring.storage.free)} Available
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Automated Backups</Label>
                          <div className="text-sm text-muted-foreground">
                            Schedule regular system backups
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={dataBackup}
                            onCheckedChange={setDataBackup}
                          />
                          <Label>{dataBackup ? "Enabled" : "Disabled"}</Label>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="backup-frequency">Backup Frequency</Label>
                          <div className="text-sm text-muted-foreground">
                            How often to create system backups
                          </div>
                        </div>
                        <Select defaultValue="daily">
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Every 6 hours</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="log-level">Logging Level</Label>
                          <div className="text-sm text-muted-foreground">
                            Detail level for system logs
                          </div>
                        </div>
                        <Select defaultValue="info">
                          <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="error">Error Only</SelectItem>
                            <SelectItem value="warn">Warning & Error</SelectItem>
                            <SelectItem value="info">Information</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="verbose">Verbose</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="cache-clear">Clear System Cache</Label>
                          <div className="text-sm text-muted-foreground">
                            Clear temporary data and cached content
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Clear Cache
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-red-600">Reset System Settings</Label>
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

        {/* Backup Dialog */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Backup System</DialogTitle>
              <DialogDescription>
                Create a backup of the entire system including database, files, and settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="backup-name">Backup Name</Label>
                <Input id="backup-name" placeholder="e.g., Full_Backup_2023_12_01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backup-description">Description (Optional)</Label>
                <Textarea id="backup-description" placeholder="Describe the purpose of this backup..." className="resize-none" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="backup-include-files" className="rounded border-gray-300" />
                <Label htmlFor="backup-include-files">Include uploaded files</Label>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">Information</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Backups are stored for 30 days. The backup process may take several minutes to complete.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowBackupDialog(false)}>
                <HardDrive className="h-4 w-4 mr-2" />
                Start Backup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Reset Settings Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Reset System Settings</DialogTitle>
              <DialogDescription>
                This will reset all system settings to their default values. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Warning</AlertTitle>
                <AlertDescription className="text-red-700">
                  Resetting will remove all customizations, integrations, and preferences. Users and data will not be affected.
                </AlertDescription>
              </Alert>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="confirm-reset" className="rounded border-gray-300" />
                <Label htmlFor="confirm-reset">I understand that this action cannot be undone</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setShowResetDialog(false)}>
                Reset All Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage;