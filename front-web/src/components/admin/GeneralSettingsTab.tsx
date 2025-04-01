import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { SystemSettings } from "../../types/settings";

interface GeneralSettingsTabProps {
  systemSettings: SystemSettings;
  handleSystemSettingChange: (key: keyof SystemSettings, value: string | number | boolean) => void;
  languagePreference: string;
  setLanguagePreference: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
}

export const GeneralSettingsTab = ({
  systemSettings,
  handleSystemSettingChange,
  languagePreference,
  setLanguagePreference,
  theme,
  setTheme,
}: GeneralSettingsTabProps) => {
  return (
    <div className="space-y-6">
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
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <div className="text-sm text-muted-foreground">
              School contact phone number
            </div>
          </div>
          <Input 
            id="contactPhone" 
            type="text"
            className="w-[250px]" 
            value={systemSettings.contactPhone}
            onChange={(e) => handleSystemSettingChange('contactPhone', e.target.value)}
          />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="address">School Address</Label>
            <div className="text-sm text-muted-foreground">
              Physical location of the school
            </div>
          </div>
          <textarea
            id="address"
            className="w-[250px] min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={systemSettings.address}
            onChange={(e) => handleSystemSettingChange('address', e.target.value)}
          />
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
    </div>
  );
}; 