import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  ChevronDown,
  Users,
  User,
  FileSpreadsheet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const performanceData = [
  { month: "Sept", math: 15, french: 14, history: 16 },
  { month: "Oct", math: 16, french: 15, history: 15 },
  { month: "Nov", math: 14, french: 16, history: 17 },
  { month: "Dec", math: 17, french: 15, history: 16 },
  { month: "Jan", math: 16, french: 17, history: 18 },
];

const skillsData = [
  { skill: "Résolution de problèmes", value: 85 },
  { skill: "Expression écrite", value: 75 },
  { skill: "Analyse critique", value: 90 },
  { skill: "Travail d'équipe", value: 80 },
];

const detailedGrades = [
  { 
    subject: "Mathématiques",
    evaluations: [
      { type: "Contrôle", date: "15/01", grade: "16/20" },
      { type: "Devoir", date: "22/01", grade: "18/20" },
    ]
  },
  {
    subject: "Français",
    evaluations: [
      { type: "Dissertation", date: "10/01", grade: "15/20" },
      { type: "Oral", date: "20/01", grade: "17/20" },
    ]
  }
];

const PerformancePage = () => {
  const [viewMode, setViewMode] = useState<"student" | "parent">("student");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Suivi des Performances
        </h1>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {viewMode === "parent" ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                {viewMode === "parent" ? "Vue Parent" : "Vue Étudiant"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setViewMode("student")}>
                <User className="h-4 w-4 mr-2" /> Vue Étudiant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("parent")}>
                <Users className="h-4 w-4 mr-2" /> Vue Parent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Rapport Personnalisé
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Moyenne Générale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">16.2/20</div>
            {viewMode === "parent" && (
              <p className="text-sm text-muted-foreground mt-1">
                +1.2 pts depuis le dernier trimestre
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Classement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3/28</div>
            {viewMode === "parent" && (
              <p className="text-sm text-muted-foreground mt-1">
                Progression de 2 places
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+2.1</div>
            {viewMode === "parent" && (
              <p className="text-sm text-muted-foreground mt-1">
                Excellente progression
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Évolution des Notes</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <Card className="backdrop-blur-sm bg-white/50">
            <CardHeader>
              <CardTitle>Évolution des Notes par Matière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="math"
                      stroke="#9b87f5"
                      name="Mathématiques"
                    />
                    <Line
                      type="monotone"
                      dataKey="french"
                      stroke="#7E69AB"
                      name="Français"
                    />
                    <Line
                      type="monotone"
                      dataKey="history"
                      stroke="#D6BCFA"
                      name="Histoire"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card className="backdrop-blur-sm bg-white/50">
            <CardHeader>
              <CardTitle>Niveau des Compétences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="skill" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#9b87f5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {viewMode === "parent" && (
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Commentaires des Professeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">
                <span className="font-semibold">Mathématiques :</span> Excellente progression ce trimestre. Continue ainsi !
              </p>
              <p className="text-sm">
                <span className="font-semibold">Français :</span> Bon travail en expression écrite. Participation active en classe.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformancePage;
