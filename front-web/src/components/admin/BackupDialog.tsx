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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { HardDrive, Info } from "lucide-react";

interface BackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackup: () => void;
}

export const BackupDialog = ({
  open,
  onOpenChange,
  onBackup,
}: BackupDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onBackup}>
            <HardDrive className="h-4 w-4 mr-2" />
            Start Backup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 