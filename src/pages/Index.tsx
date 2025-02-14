
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  BarChart2,
  HeadphonesIcon,
} from "lucide-react";

const features = [
  {
    title: "Gestion des Présences",
    description: "Suivez les présences en temps réel",
    icon: Users,
    path: "/attendance",
  },
  {
    title: "Devoirs et Évaluations",
    description: "Gérez les devoirs et les notes",
    icon: BookOpen,
    path: "/assignments",
  },
  {
    title: "Suivi des Performances",
    description: "Analysez les progrès des élèves",
    icon: BarChart2,
    path: "/performance",
  },
  {
    title: "Support et Assistance",
    description: "Obtenez de l'aide rapidement",
    icon: HeadphonesIcon,
    path: "/support",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Smart Scolarité Manager
        </h1>
        <p className="text-lg text-gray-600">
          Gérez votre établissement scolaire de manière intelligente et efficace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {features.map((feature) => (
          <Card
            key={feature.path}
            className="backdrop-blur-sm bg-white/50 hover:bg-white/60 transition-all duration-300"
          >
            <Link to={feature.path}>
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Button className="w-full">Accéder</Button>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
