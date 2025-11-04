'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { darpanAssistant } from "@/ai/flows/darpan-flow";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, Send, ArrowLeft } from "lucide-react";

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

export default function ChatPage() {
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
            setMessages(prev => prev.slice(0, prev.length -1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
             <header className="bg-card border-b sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                         <div className="flex items-center gap-4">
                            <Button asChild variant="ghost" size="icon">
                                <Link href="/">
                                    <ArrowLeft />
                                </Link>
                            </Button>
                            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary font-headline">
                                <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={40} height={40} className="rounded-full" />
                                <span>Darpan 2.0 AI Assistant</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            <ScrollArea className="flex-1 p-4">
                 <div className="space-y-4 max-w-2xl mx-auto w-full">
                     <div className="flex justify-start">
                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                           <Bot className="h-5 w-5" />
                           <span>Hello! How can I help you with your shopping today?</span>
                        </div>
                    </div>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
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
            <div className="border-t bg-card">
                 <form onSubmit={handleSend} className="flex gap-2 p-4 max-w-2xl mx-auto">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about our products, how to order, etc..."
                        disabled={isLoading}
                        className="h-12 text-base"
                    />
                    <Button type="submit" disabled={isLoading} size="icon" className="h-12 w-12">
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
