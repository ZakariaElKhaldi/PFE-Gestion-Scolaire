import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { AiProfileService } from '@/services/ai-profile.service';
import { Loader2 } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

export function AIAssistantWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage: Message = {
      type: 'user',
      content: query
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);
    
    try {
      const response = await AiProfileService.queryProfile(query);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying AI assistant:', error);
      
      const errorMessage: Message = {
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your query. Please try again later.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>Ask any question about your courses, assignments, or educational topics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 h-60 overflow-y-auto p-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Ask a question to get started
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleQuerySubmit} className="flex gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask something..."
            className="resize-none min-h-[60px]"
          />
          <Button type="submit" size="icon" disabled={isLoading || !query.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <span>Powered by AI Profiles</span>
      </CardFooter>
    </Card>
  );
} 