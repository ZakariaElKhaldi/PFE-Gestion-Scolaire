import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  FileText, 
  FileUp,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  Book,
  Calendar,
  ClipboardList
} from "lucide-react";

// Mock data
const mockSubmissions = [
  {
    id: 1,
    student: "Alice Martin",
    assignment: "Dissertation Histoire",
    submittedDate: "2024-03-19",
    file: "dissertation_histoire.pdf",
    status: "pending",
  },
  {
    id: 2,
    student: "Thomas Bernard",
    assignment: "Exercices Mathématiques",
    submittedDate: "2024-03-18",
    file: "maths_ex4.pdf",
    status: "corrected",
    grade: "16/20",
    feedback: "Excellent travail sur les équations. Attention aux détails dans la dernière partie.",
  },
];

const mockNotifications = [
  {
    id: 1,
    type: "deadline",
    title: "Dissertation Histoire à rendre",
    description: "Date limite : Demain à 23:59",
    priority: "high",
  },
  {
    id: 2,
    type: "result",
    title: "Note disponible : Exercices Mathématiques",
    description: "Votre note et les commentaires sont disponibles",
    priority: "normal",
  },
];

const mockAssignments = [
  {
    id: 1,
    title: "Dissertation Histoire",
    subject: "Histoire",
    dueDate: "2024-03-20",
    status: "pending",
  },
  {
    id: 2,
    title: "Exercices Mathématiques",
    subject: "Mathématiques",
    dueDate: "2024-03-18",
    status: "submitted",
  },
];

const mockExams = [
  {
    id: 1,
    title: "Contrôle de Mathématiques",
    subject: "Mathématiques",
    date: "2024-04-10",
    type: "Contrôle",
  },
  {
    id: 2,
    title: "Examen Final d'Histoire",
    subject: "Histoire",
    date: "2024-05-15",
    type: "Examen",
  },
];

// Dashboard Stats Component
const DashboardStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <Card className="p-4 bg-blue-50">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-blue-100">
          <Book className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-blue-600">Devoirs en cours</p>
          <p className="text-2xl font-semibold text-blue-700">12</p>
        </div>
      </div>
    </Card>
    <Card className="p-4 bg-green-50">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-green-100">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm text-green-600">Devoirs corrigés</p>
          <p className="text-2xl font-semibold text-green-700">45</p>
        </div>
      </div>
    </Card>
  </div>
);

// Assignment List Component
const AssignmentList = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input className="pl-10 w-full" placeholder="Rechercher un devoir..." />
        </div>
        <Button variant="secondary" className="w-full sm:w-auto gap-2">
          <Filter className="w-4 h-4" />
          Filtrer
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockAssignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-medium text-lg text-black">{assignment.title}</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Book className="w-4 h-4" />
                    {assignment.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {assignment.dueDate}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  assignment.status === "submitted"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {assignment.status === "submitted" ? "Rendu" : "En cours"}
                </span>
                <Button variant="secondary" size="sm">
                  Voir détails
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Correction List Component
const CorrectionList = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input className="pl-10 w-full" placeholder="Rechercher une correction..." />
        </div>
        <Button variant="secondary" className="w-full sm:w-auto gap-2">
          <Filter className="w-4 h-4" />
          Filtrer
        </Button>
      </div>
      
      <div className="grid gap-4">
        {mockSubmissions
          .filter(submission => submission.status === "corrected")
          .map((submission) => (
            <Card
              key={submission.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-medium text-lg text-black">{submission.assignment}</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Book className="w-4 h-4" />
                      {submission.student}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {submission.submittedDate}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Note: {submission.grade}</p>
                    <p className="text-sm text-gray-600">Feedback: {submission.feedback}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  Voir détails
                </Button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};

// Exam Planning Component
const ExamPlanning = () => {
  const [exams, setExams] = useState(mockExams);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExam = {
      id: exams.length + 1,
      title: String(formData.get("title")),
      subject: String(formData.get("subject")),
      date: String(formData.get("date")),
      type: String(formData.get("type")),
    };
    setExams([...exams, newExam]);
    setSuccessMessage("Planification ajoutée avec succès !");
    setTimeout(() => setSuccessMessage(""), 3000);
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      <Card className="w-full sm:max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">Ajouter une planification</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre</label>
            <Input name="title" placeholder="Titre du contrôle ou de l'examen" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Matière</label>
            <Input name="subject" placeholder="Matière" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Input name="type" placeholder="Contrôle, Examen, Évaluation" required />
          </div>
          <Button type="submit" className="w-full">Ajouter la planification</Button>
        </form>
      </Card>
    </div>
  );
};

// Add Correction Component
const AddCorrection = () => {
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("Correction soumise avec succès !");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <Card className="w-full sm:max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">Ajouter une correction</h2>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Devoir/Examen</label>
          <Input placeholder="Sélectionner un devoir ou un examen" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Étudiant</label>
          <Input placeholder="Sélectionner un étudiant" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Note</label>
          <Input type="number" placeholder="Note sur 20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Feedback</label>
          <Textarea placeholder="Commentaires sur la correction..." className="min-h-[150px]" />
        </div>
        <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-50">
          <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">Glissez-déposez le fichier corrigé ici ou</p>
          <Button variant="secondary">Parcourir les fichiers</Button>
        </div>
        <Button type="submit" className="w-full">Soumettre la correction</Button>
      </form>
    </Card>
  );
};

// Notification Panel Component
const NotificationPanel = ({ onClose, exams }) => (
  <Card className="p-6 fixed sm:absolute right-0 top-16 w-full sm:w-96 shadow-xl z-50 bg-white">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <Button variant="secondary" size="sm" onClick={onClose}>
        ✕
      </Button>
    </div>
    <div className="space-y-4">
      {mockNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg ${
            notification.priority === "high"
              ? "bg-red-50 border-red-200"
              : "bg-gray-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === "deadline" ? (
              <Clock className="w-5 h-5 text-orange-500 mt-1" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
            )}
            <div>
              <h3 className="font-medium text-black">{notification.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6">
        <h3 className="font-medium text-black mb-4">Examens planifiés</h3>
        {exams.map((exam) => (
          <div key={exam.id} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{exam.title}</h4>
            <p className="text-sm text-gray-600">{exam.subject} - {exam.date}</p>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

// Main Assignments Component as a const
const Assignments = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [exams, setExams] = useState(mockExams);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("Devoir créé avec succès");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Devoirs et Évaluations</h1>
            <p className="text-gray-600 mt-1">Gérez vos devoirs, examens et corrections</p>
          </div>
          <div className="relative mt-4 sm:mt-0">
            <Button
              variant="secondary"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} exams={exams} />
            )}
          </div>
        </div>
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        <DashboardStats />
        <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="flex flex-row w-full justify-start border-b bg-transparent p-0 mb-6">
  <TabsTrigger 
    value="list" 
    className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
  >
    Devoirs
  </TabsTrigger>
  <TabsTrigger 
    value="new"
    className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
  >
    Add devoir
  </TabsTrigger>
  <TabsTrigger 
    value="feedback"
    className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
  >
    Corrections
  </TabsTrigger>
  <TabsTrigger 
    value="add-correction"
    className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
  >
    Add correction
  </TabsTrigger>
  <TabsTrigger 
    value="planning"
    className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
  >
    Planification
  </TabsTrigger>
</TabsList>
          <TabsContent value="list">
            <AssignmentList />
          </TabsContent>
          <TabsContent value="new">
            <Card className="w-full sm:max-w-2xl mx-auto p-6">
              <h2 className="text-xl font-semibold mb-6">Créer un nouveau devoir</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre</label>
                  <Input placeholder="Titre du devoir" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Instructions détaillées..." className="min-h-[150px]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Matière</label>
                    <Input placeholder="Sélectionner une matière" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date limite</label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-50">
                  <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Glissez-déposez vos fichiers ici ou
                  </p>
                  <Button variant="secondary">Parcourir les fichiers</Button>
                </div>
                <Button type="submit" className="w-full">Créer le devoir</Button>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="feedback">
            <CorrectionList />
          </TabsContent>
          <TabsContent value="add-correction">
            <AddCorrection />
          </TabsContent>
          <TabsContent value="planning">
            <ExamPlanning />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Assignments;