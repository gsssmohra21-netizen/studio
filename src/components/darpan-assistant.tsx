'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export function DarpanAssistantButton() {
    return (
        <Button asChild className="fixed bottom-6 right-6 h-14 w-auto px-5 rounded-full shadow-lg animate-bounce">
            <Link href="/chat">
                <Bot className="mr-2 h-6 w-6"/>
                Chat with our AI
            </Link>
        </Button>
    );
}
