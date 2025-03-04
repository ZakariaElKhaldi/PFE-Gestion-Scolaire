import { useState, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";  
import { toast } from "sonner";
import { Bell, BellOff, Users, Search, MoreVertical } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface Message {
  id: number;
  message: string;
  sender: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  avatar?: string;
}

export const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      message: "Bienvenue dans le chat de l'école ! 👋",
      sender: "System",
      timestamp: new Date().toLocaleTimeString(),
      status: 'read' as const,
      avatar: '/avatars/system.png'
    },
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      message,
      sender: "You",
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent' as const,
      avatar: '/avatars/user.png'
    };
    setMessages((prev) => [...prev, newMessage]);
    
    if (notificationsEnabled) {
      toast("Nouveau message", {
        description: `${newMessage.sender}: ${message}`,
        duration: 3000,
      });
    }

    // Simulate message being delivered and read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'delivered' as const} : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'read' as const} : msg
        )
      );
    }, 2000);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast(notificationsEnabled ? "Notifications désactivées" : "Notifications activées", {
      duration: 2000,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Chat de l'École</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              3 utilisateurs connectés
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="hover:bg-gray-100"
                >
                  <Search className="h-5 w-5 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rechercher dans les messages</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleNotifications}
                  className="hover:bg-gray-100"
                >
                  {notificationsEnabled ? (
                    <Bell className="h-5 w-5 text-gray-500" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-500" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-gray-100"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Plus d'options</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search Bar - Conditional Render */}
      {searchVisible && (
        <div className="bg-white border-b p-2">
          <Input
            type="text"
            placeholder="Rechercher dans les messages..."
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Messages */}
      <div 
        id="messages-container"
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            sender={msg.sender}
            timestamp={msg.timestamp}
            isOwn={msg.sender === "You"}
            status={msg.status}
            avatar={msg.avatar}
          />
        ))}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};
