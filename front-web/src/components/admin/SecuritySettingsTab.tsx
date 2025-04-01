import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { SecuritySettings } from "../../types/settings";

interface SecuritySettingsTabProps {
  securitySettings: SecuritySettings;
  handleSecuritySettingChange: (key: keyof SecuritySettings, value: any) => void;
  enableRegistration: boolean;
  setEnableRegistration: (value: boolean) => void;
}

export const SecuritySettingsTab = ({
  securitySettings,
  handleSecuritySettingChange,
  enableRegistration,
  setEnableRegistration,
}: SecuritySettingsTabProps) => {
  return (
    <div className="space-y-6">
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
            <Label htmlFor="allowedIpRanges">Allowed IP Ranges</Label>
            <div className="text-sm text-muted-foreground">
              Restrict access to specific IP ranges (comma separated)
            </div>
          </div>
          <Input 
            id="allowedIpRanges" 
            className="w-[250px]" 
            value={securitySettings.allowedIpRanges}
            onChange={(e) => handleSecuritySettingChange('allowedIpRanges', e.target.value)}
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
    </div>
  );
}; 