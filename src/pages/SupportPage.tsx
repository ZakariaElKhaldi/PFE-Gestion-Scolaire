
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { MessageCircle, TicketIcon } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Comment justifier une absence ?",
    answer:
      "Pour justifier une absence, vous devez fournir un justificatif (certificat médical, etc.) via la section 'Gestion des Absences' dans un délai de 48 heures.",
  },
  {
    question: "Comment contacter un professeur ?",
    answer:
      "Vous pouvez contacter vos professeurs via la messagerie interne de l'application ou pendant leurs heures de permanence indiquées dans leur profil.",
  },
  {
    question: "Comment récupérer mon mot de passe ?",
    answer:
      "Cliquez sur 'Mot de passe oublié' sur la page de connexion et suivez les instructions envoyées à votre adresse email.",
  },
];

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <h1 className="text-3xl font-bold tracking-tight">Support et Assistance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Chat en Direct</CardTitle>
            <CardDescription>
              Besoin d'aide ? Nos conseillers sont là pour vous.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Démarrer une conversation
            </Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/50">
          <CardHeader>
            <CardTitle>Tickets Support</CardTitle>
            <CardDescription>
              Signalez un problème technique ou une demande spécifique.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Créer un ticket
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-sm bg-white/50">
        <CardHeader>
          <CardTitle>Questions Fréquentes</CardTitle>
          <CardDescription>
            Trouvez rapidement des réponses à vos questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Rechercher dans les FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Accordion type="single" collapsible className="w-full">
            {faqs
              .filter(
                (faq) =>
                  faq.question
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
