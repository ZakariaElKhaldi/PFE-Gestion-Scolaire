import { useState, useEffect } from "react";
import { User } from "../../../types/auth";
import { StudentLayout } from "../../../components/dashboard/layout/student-layout";
import { Accordion, AccordionItem } from "../../../components/Accordion";
import {
  HelpCircle,
  Ticket,
  MessageCircle,
  AlertCircle,
  ChevronDown,
  Send,
  Calendar,
  CheckCircle,
  XCircle,
  Bot,
} from "lucide-react";
import { AIAssistant } from "../../../components/dashboard/support/AIAssistant";
import { AITicketHelper } from "../../../components/dashboard/support/AITicketHelper";

interface StudentSupportProps {
  user: User;
}

const faqs = [
  {
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "Pour réinitialiser votre mot de passe, allez sur la page 'Mot de passe oublié' et suivez les instructions."
  },
  {
    question: "Comment soumettre un devoir ?",
    answer: "Pour soumettre un devoir, allez sur la page 'Devoirs', sélectionnez le devoir et cliquez sur 'Soumettre'."
  },
  {
    question: "Comment contacter le support technique ?",
    answer: "Vous pouvez ouvrir un ticket dans la section 'Système de Tickets' ou utiliser le chat en direct."
  },
  {
    question: "Comment vérifier mes notes ?",
    answer: "Accédez à la section 'Évaluations' pour consulter vos notes et les commentaires des enseignants."
  },
  // Ajoutez plus de FAQ ici
];

interface Ticket {
  id: number;
  title: string;
  description: string;
  urgency: "low" | "medium" | "high";
  status: "open" | "resolved";
  date: string;
}

export default function StudentSupport({ user }: StudentSupportProps) {
  const [activeTab, setActiveTab] = useState<"faq" | "tickets" | "chat">("faq");
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      title: "Problème de connexion",
      description: "Je n'arrive pas à me connecter à mon compte.",
      urgency: "high",
      status: "open",
      date: "2023-10-01",
    },
    {
      id: 2,
      title: "Devoir non noté",
      description: "Mon devoir n'a pas été noté après la date limite.",
      urgency: "medium",
      status: "resolved",
      date: "2023-09-25",
    },
  ]);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    urgency: "low" as "low" | "medium" | "high",
  });
  const [supportAgentAvailable, setSupportAgentAvailable] = useState(false);
  const [humanSupportRequested, setHumanSupportRequested] = useState(false);

  // Simulate a support agent becoming available after some time (for demo purposes)
  useEffect(() => {
    if (humanSupportRequested) {
      const timer = setTimeout(() => {
        setSupportAgentAvailable(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [humanSupportRequested]);

  const handleCreateTicket = () => {
    if (newTicket.title.trim() === "" || newTicket.description.trim() === "") return;
    const ticket: Ticket = {
      id: tickets.length + 1,
      title: newTicket.title,
      description: newTicket.description,
      urgency: newTicket.urgency,
      status: "open",
      date: new Date().toISOString().split("T")[0],
    };
    setTickets([...tickets, ticket]);
    setNewTicket({ title: "", description: "", urgency: "low" });
  };
  
  const handleHumanSupportRequest = () => {
    setHumanSupportRequested(true);
  };

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Support et Assistance</h1>
        <p className="mt-1 text-sm text-gray-500">
          FAQ, système de tickets et chat en direct pour une assistance rapide.
        </p>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-1 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === "faq"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-1 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === "tickets"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Ticket className="h-4 w-4" />
              Tickets
            </button>
            <button
              onClick={() => {
                setActiveTab("chat");
                // Reset the support agent status when switching to chat
                setSupportAgentAvailable(false);
                setHumanSupportRequested(false);
              }}
              className={`px-1 py-4 text-sm font-medium flex items-center gap-2 ${
                activeTab === "chat"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </button>
          </nav>
        </div>

        {/* Contenu en fonction de l'onglet actif */}
        {activeTab === "faq" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              FAQ
            </h2>
            <div className="mt-4 space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-blue-600" />
              Système de Tickets
            </h2>
            <div className="space-y-6">
              {/* Formulaire de création de ticket */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Créer un nouveau ticket
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="ticketTitle" className="block text-sm font-medium text-gray-700">
                      Titre du ticket
                    </label>
                    <input
                      id="ticketTitle"
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      placeholder="Entrez un titre"
                    />
                  </div>
                  <div>
                    <label htmlFor="ticketDescription" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="ticketDescription"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Décrivez votre problème ici..."
                    />
                  </div>
                  <div>
                    <label htmlFor="ticketUrgency" className="block text-sm font-medium text-gray-700">
                      Taux d'urgence
                    </label>
                    <div className="relative">
                      <select
                        id="ticketUrgency"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2 appearance-none"
                        value={newTicket.urgency}
                        onChange={(e) =>
                          setNewTicket({ ...newTicket, urgency: e.target.value as "low" | "medium" | "high" })
                        }
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyen</option>
                        <option value="high">Élevé</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateTicket}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Créer Ticket
                  </button>
                </div>
              </div>

              {/* Liste des tickets */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  Tickets
                </h3>
                <div className="mt-4 space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {ticket.date}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            ticket.urgency === "high"
                              ? "bg-red-100 text-red-700"
                              : ticket.urgency === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ticket.urgency === "high"
                            ? "Élevé"
                            : ticket.urgency === "medium"
                            ? "Moyen"
                            : "Faible"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{ticket.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            ticket.status === "open" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ticket.status === "open" ? "Ouvert" : "Résolu"}
                        </span>
                      </div>
                      
                      {/* AI Ticket Helper */}
                      {ticket.status === "open" && (
                        <div className="mt-4">
                          <AITicketHelper 
                            ticketTitle={ticket.title} 
                            ticketDescription={ticket.description} 
                            ticketUrgency={ticket.urgency}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Chat en Direct
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="h-96 flex flex-col justify-between">
                {supportAgentAvailable ? (
                  <div className="h-full flex flex-col space-y-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="font-medium text-green-800">Agent de support connecté</p>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Un agent humain a rejoint la conversation. Comment puis-je vous aider aujourd'hui?
                      </p>
                    </div>
                    
                    {/* Messages du chat - historique avec un agent réel */}
                    <div className="space-y-4 overflow-y-auto flex-1">
                      <div className="flex justify-end">
                        <div className="bg-blue-100 p-3 rounded-lg max-w-[70%]">
                          <p className="text-sm text-gray-700">Bonjour, j'ai un problème avec mon devoir.</p>
                          <p className="text-xs text-gray-500 text-right mt-1">10:12 AM</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg max-w-[70%]">
                          <p className="text-sm text-gray-700">Bonjour! Je suis Sarah du support technique. Pouvez-vous me donner plus de détails sur le problème que vous rencontrez?</p>
                          <p className="text-xs text-gray-500 text-right mt-1">10:13 AM</p>
                        </div>
                      </div>
                    </div>

                    {/* Zone de saisie du message */}
                    <div className="mt-4 flex items-center gap-2">
                      <textarea
                        rows={2}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2"
                        placeholder="Tapez votre message..."
                      />
                      <button className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700" title="Envoyer">
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-600">
                        Assistant IA est actif - un agent de support humain sera disponible sous peu
                      </p>
                    </div>
                    <div className="h-[calc(100%-2rem)]">
                      <AIAssistant
                        supportWaitingTime={20}
                        onHumanSupportRequest={handleHumanSupportRequest}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}