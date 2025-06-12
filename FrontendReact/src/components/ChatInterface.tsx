
import React, { useState } from 'react';
import { ask, Source } from '@/api';   //  ← importe la fonction
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}


 const ChatInterface = () => {

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant santé intelligent. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'bot',
      timestamp: new Date(),
    },
    
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulation d'appel API Flask
    try {
  const res = await ask({ question: userMessage.text });
  const botMessage: Message = {
    id: (Date.now() + 1).toString(),
    text: res.answer,
    sender: 'bot',
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, botMessage]);
} catch (err: any) {
  const errMsg: Message = {
    id: (Date.now() + 1).toString(),
    text: "⚠️ " + err.message,
    sender: 'bot',
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, errMsg]);
} finally {
  setIsLoading(false);
}

  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section id="chat" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Assistant Chatbot</h2>
        
        <Card className="max-w-4xl mx-auto h-96">
          <CardContent className="p-0 h-full flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.sender === 'bot' ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted px-4 py-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
               
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question sur la santé en Tunisie..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
 
  );


};
export default ChatInterface;

