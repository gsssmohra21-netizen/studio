
'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { darpanAssistant } from "@/ai/flows/darpan-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Loader2, Send } from "lucide-react";

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

export function DarpanAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await darpanAssistant({ question: input });
            const aiMessage: Message = { sender: 'ai', text: result.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Darpan 2.0 is having a little trouble. Please try again in a moment.",
            });
            // Remove the user's message if the AI fails
            setMessages(prev => prev.slice(0, prev.length -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 border-2 border-dashed rounded-lg bg-primary/5">
            <div className="flex flex-col items-center gap-4 text-center">
                <Bot className="h-12 w-12 text-primary" />
                <h2 className="text-3xl font-bold font-headline text-primary">Darpan 2.0 AI Assistant</h2>
                <p className="text-muted-foreground max-w-md">
                    Have questions? Ask me for help with ordering, products, or anything else!
                </p>
            </div>
            <div className="mt-6 max-w-lg mx-auto">
                <Card>
                    <CardContent className="p-4">
                        <ScrollArea className="h-64 mb-4 pr-4">
                             <div className="space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Thinking...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <form onSubmit={handleSend} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about our products..."
                                disabled={isLoading}
                            />
                            <Button type="submit" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
