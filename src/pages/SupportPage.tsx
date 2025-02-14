import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, Search, Plus } from "lucide-react";
import { useState } from "react";

// Mock FAQ data
const faqData = [
  {
    question: "Comment marquer les présences ?",
    answer: "Utilisez la page de présences pour marquer les élèves présents ou absents. Vous pouvez également justifier les absences et envoyer des notifications aux parents.",
  },
  {
    question: "Comment assigner un devoir ?",
    answer: "Dans la page des devoirs, cliquez sur 'Nouveau devoir', remplissez les informations nécessaires et définissez une date limite. Vous pouvez joindre des fichiers si nécessaire.",
  },
  {
    question: "Comment accéder aux rapports de performance ?",
    answer: "La page de performances vous permet de visualiser les statistiques par classe, matière ou élève. Vous pouvez également générer des rapports détaillés.",
  },
];

// Mock ticket data
const mockTickets = [
  {
    id: 1,
    title: "Problème de connexion",
    status: "open",
    priority: "high",
    date: "2024-03-15",
    description: "Je n'arrive pas à me connecter à mon compte.",
  },
  {
    id: 2,
    title: "Question sur les devoirs",
    status: "closed",
    priority: "medium",
    date: "2024-03-14",
    description: "Comment puis-je soumettre un devoir en retard ?",
  },
];

// FAQ Component
function SupportFAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans la FAQ..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <Accordion type="single" collapsible className="w-full">
        {filteredFAQ.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left hover:bg-gray-50 rounded-lg p-4">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="p-4 text-gray-600">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// Chat Component
function SupportChat() {
  const [message, setMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div className="h-[600px] border rounded-lg bg-white flex flex-col shadow-sm">
      <div className="p-4 border-b bg-primary/10 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-medium text-primary">Chat avec le support</h2>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col gap-4">
          <div className="bg-primary/10 p-3 rounded-lg max-w-[80%]">
            <p className="text-sm text-primary">
              Bonjour ! Comment puis-je vous aider aujourd'hui ?
            </p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Écrivez votre message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

// Tickets Component
function SupportTickets() {
  const [showNewTicket, setShowNewTicket] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Mes tickets</h2>
        <Button onClick={() => setShowNewTicket(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau ticket
        </Button>
      </div>

      {showNewTicket && (
        <div className="bg-white p-6 rounded-lg border shadow-sm animate-fade-in space-y-4">
          <h3 className="font-medium text-lg">Créer un nouveau ticket</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input placeholder="Décrivez brièvement votre problème" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Donnez plus de détails sur votre problème..." />
            </div>
            <div>
              <label className="text-sm font-medium">Priorité</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowNewTicket(false)}>
                Annuler
              </Button>
              <Button className="bg-primary hover:bg-primary/90">Créer le ticket</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {mockTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white p-4 rounded-lg border shadow-sm animate-fade-in"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{ticket.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {ticket.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Créé le {ticket.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ticket.status === "open" ? "Ouvert" : "Fermé"}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    ticket.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : ticket.priority === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {ticket.priority === "high"
                    ? "Urgent"
                    : ticket.priority === "medium"
                    ? "Moyen"
                    : "Faible"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Support Page
export default function Support() {
  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Support</h1>
            <p className="text-gray-600">
              Besoin d'aide ? Consultez notre FAQ ou contactez-nous
            </p>
          </div>

          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="w-full justify-start border-b bg-transparent p-0 mb-6">
              <TabsTrigger
                value="faq"
                className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                FAQ
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Tickets
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="data-[state=active]:border-l-4 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Chat en direct
              </TabsTrigger>
            </TabsList>
            <TabsContent value="faq" className="mt-4">
              <SupportFAQ />
            </TabsContent>
            <TabsContent value="tickets" className="mt-4">
              <SupportTickets />
            </TabsContent>
            <TabsContent value="chat" className="mt-4">
              <SupportChat />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}