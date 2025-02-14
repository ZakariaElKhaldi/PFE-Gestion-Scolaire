
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Bell,
  BellOff 
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const classes = [
  "Terminale S",
  "Terminale ES",
  "Terminale L",
  "Première S",
  "Première ES",
  "Première L",
];

const studentsData = {
  "Terminale S": [
    { id: 1, name: "Alice Martin", notifications: true },
    { id: 2, name: "Thomas Bernard", notifications: false },
    { id: 3, name: "Sarah Dubois", notifications: true },
    { id: 4, name: "Lucas Petit", notifications: true },
    { id: 5, name: "Emma Richard", notifications: false },
  ],
  "Terminale ES": [
    { id: 6, name: "Jules Moreau", notifications: true },
    { id: 7, name: "Louise Dubois", notifications: true },
    { id: 8, name: "Maxime Leroy", notifications: false },
  ],
  "Première S": [
    { id: 9, name: "Clara Simon", notifications: true },
    { id: 10, name: "Hugo Martin", notifications: true },
  ],
};

const AttendancePage = () => {
  const [selectedClass, setSelectedClass] = useState("Terminale S");
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [notifications, setNotifications] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const handleAttendance = (studentId: number, present: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: present }));
    
    if (!present) {
      const student = studentsData[selectedClass].find(s => s.id === studentId);
      if (student?.notifications) {
        toast({
          title: "Notification envoyée",
          description: `Une notification d'absence a été envoyée pour ${student.name}`,
          duration: 3000,
        });
      }
    }
    
    toast({
      title: present ? "Présence marquée" : "Absence marquée",
      description: `Le statut a été mis à jour avec succès.`,
      duration: 2000,
    });
  };

  const toggleNotifications = (studentId: number) => {
    setNotifications(prev => {
      const newValue = !prev[studentId];
      return { ...prev, [studentId]: newValue };
    });
    
    toast({
      title: "Notifications mises à jour",
      description: `Les notifications ont été ${notifications[studentId] ? "désactivées" : "activées"}.`,
      duration: 2000,
    });
  };

  const exportAttendance = (format: "pdf" | "excel") => {
    toast({
      title: "Export initié",
      description: `Le rapport sera téléchargé en format ${format.toUpperCase()}.`,
      duration: 2000,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Présences</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportAttendance("pdf")}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => exportAttendance("excel")}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <Select defaultValue={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner une classe" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((className) => (
              <SelectItem key={className} value={className}>
                {className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="backdrop-blur-sm bg-white/50 shadow-xl">
        <CardHeader>
          <CardTitle>Liste de Présence - {selectedClass}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Notifications</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsData[selectedClass]?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNotifications(student.id)}
                      className={notifications[student.id] ? "text-purple-600" : "text-gray-400"}
                    >
                      {notifications[student.id] ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${
                          attendance[student.id] === true
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                        onClick={() => handleAttendance(student.id, true)}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${
                          attendance[student.id] === false
                            ? "text-red-600"
                            : "text-gray-400"
                        }`}
                        onClick={() => handleAttendance(student.id, false)}
                      >
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
