
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";

const assignments = [
  {
    id: 1,
    title: "Dissertation - La Révolution Française",
    subject: "Histoire",
    dueDate: "2024-02-20",
    status: "pending",
  },
  {
    id: 2,
    title: "Exercices d'Algèbre",
    subject: "Mathématiques",
    dueDate: "2024-02-18",
    status: "submitted",
  },
  {
    id: 3,
    title: "Analyse de texte - Les Misérables",
    subject: "Français",
    dueDate: "2024-02-25",
    status: "graded",
    grade: "18/20",
  },
];

const AssignmentsPage = () => {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Devoirs et Évaluations
        </h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nouveau Devoir
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">À Rendre</TabsTrigger>
          <TabsTrigger value="submitted">Soumis</TabsTrigger>
          <TabsTrigger value="graded">Notés</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {assignments
            .filter((a) => a.status === "pending")
            .map((assignment) => (
              <Card key={assignment.id} className="backdrop-blur-sm bg-white/50">
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>À rendre le {assignment.dueDate}</span>
                    </div>
                    <Button>Soumettre</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {assignments
            .filter((a) => a.status === "submitted")
            .map((assignment) => (
              <Card key={assignment.id} className="backdrop-blur-sm bg-white/50">
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>Soumis le {assignment.dueDate}</span>
                    </div>
                    <Button variant="secondary">En attente</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {assignments
            .filter((a) => a.status === "graded")
            .map((assignment) => (
              <Card key={assignment.id} className="backdrop-blur-sm bg-white/50">
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4" />
                      <span>Note: {assignment.grade}</span>
                    </div>
                    <Button variant="outline">Voir le feedback</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentsPage;
