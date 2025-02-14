
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
import { Download, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const students = [
  { id: 1, name: "Alice Martin", class: "Terminale S" },
  { id: 2, name: "Thomas Bernard", class: "Terminale S" },
  { id: 3, name: "Sarah Dubois", class: "Terminale S" },
  { id: 4, name: "Lucas Petit", class: "Terminale S" },
  { id: 5, name: "Emma Richard", class: "Terminale S" },
];

const AttendancePage = () => {
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const handleAttendance = (studentId: number, present: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: present }));
    toast({
      title: present ? "Présence marquée" : "Absence marquée",
      description: `Le statut a été mis à jour avec succès.`,
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

      <Card className="backdrop-blur-sm bg-white/50 shadow-xl">
        <CardHeader>
          <CardTitle>Liste de Présence - Aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
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
