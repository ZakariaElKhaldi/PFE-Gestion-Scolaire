import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";

interface ResetSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export const ResetSettingsDialog = ({
  open,
  onOpenChange,
  onReset,
}: ResetSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onReset}>
            Reset All Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 