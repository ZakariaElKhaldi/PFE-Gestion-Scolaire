import { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Send, Paperclip, Smile } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hover:bg-gray-100"
              >
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Joindre un fichier</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Écrivez votre message..."
            className="pr-10 min-h-[44px] text-base"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <Button 
          type="submit" 
          variant="default"
          size="icon"
          className={cn(
            "bg-primary hover:bg-primary/90 transition-all",
            !message.trim() && "opacity-50 cursor-not-allowed"
          )}
          disabled={!message.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};
