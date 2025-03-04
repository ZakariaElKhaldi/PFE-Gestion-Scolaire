import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface ChatMessageProps {
  message: string;
  sender: string;
  timestamp: string;
  isOwn?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  avatar?: string;
}

export const ChatMessage = ({ 
  message, 
  sender, 
  timestamp, 
  isOwn,
  status,
  avatar 
}: ChatMessageProps) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full animate-message-appear items-end gap-2",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={sender} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                {sender[0]}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
          isOwn
            ? "bg-primary text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
        )}
      >
        {!isOwn && (
          <div className="font-semibold text-sm mb-1">{sender}</div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs opacity-70">{timestamp}</span>
          {getStatusIcon()}
        </div>
      </div>

      {isOwn && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={sender} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                {sender[0]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
