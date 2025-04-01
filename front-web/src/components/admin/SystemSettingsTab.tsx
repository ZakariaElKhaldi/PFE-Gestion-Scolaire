import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { FeatureFlags, ResourceLimits } from "../../types/settings";
import { SystemMonitoring } from "./SystemMonitoring";

interface SystemSettingsTabProps {
  featureFlags: FeatureFlags;
  handleFeatureFlagChange: (key: keyof FeatureFlags) => void;
  resourceLimits: ResourceLimits;
  handleResourceLimitChange: (key: keyof ResourceLimits, value: number) => void;
}

export const SystemSettingsTab = ({
  featureFlags,
  handleFeatureFlagChange,
  resourceLimits,
  handleResourceLimitChange,
}: SystemSettingsTabProps) => {
  return (
    <div className="space-y-6">
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
      <SystemMonitoring />
    </div>
  );
}; 