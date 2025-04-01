import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { NotificationSettings } from "../../types/settings";

interface NotificationsTabProps {
  notificationSettings: NotificationSettings;
  handleNotificationSettingChange: (key: keyof NotificationSettings, value: boolean) => void;
  smsNotifications: boolean;
  setSmsNotifications: (value: boolean) => void;
}

export const NotificationsTab = ({
  notificationSettings,
  handleNotificationSettingChange,
  smsNotifications,
  setSmsNotifications,
}: NotificationsTabProps) => {
  return (
    <div className="space-y-6">
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
    </div>
  );
}; 