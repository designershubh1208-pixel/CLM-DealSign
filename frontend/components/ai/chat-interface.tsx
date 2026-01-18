"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Send, User, Bot, Sparkles } from "lucide-react";
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
    contractId: string;
    history: ChatMessage[];
    onSendMessage: (message: string) => Promise<void>;
    isLoading: boolean;
}

const SUGGESTED_QUESTIONS = [
    "What are the payment terms?",
    "Is there a termination for convenience clause?",
    "What is the liability cap?",
    "Who owns the IP rights?"
];

export function ChatInterface({ contractId, history, onSendMessage, isLoading }: ChatInterfaceProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const message = input;
        setInput("");
        await onSendMessage(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-sm">AI Contract Assistant</h3>
            </div>

            <ScrollArea className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400" ref={scrollRef}>
                <div className="space-y-4">
                    {history.length === 0 && (
                        <div className="text-center text-muted-foreground py-10 space-y-4">
                            <Bot className="h-12 w-12 mx-auto opacity-20" />
                            <p className="text-sm">Ask me anything about this contract.</p>
                            <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSendMessage(q)}
                                        className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-md transition-colors text-left"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {history.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 max-w-[85%]",
                                msg.role === "user" ? "ml-auto" : "mr-auto"
                            )}
                        >
                            {msg.role === "assistant" && (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "p-3 rounded-lg text-sm",
                                    msg.role === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                                )}
                            >
                                {/* sanitize and preserve newlines to avoid truncated-looking output */}
                                {(() => {
                                    const safe = (msg.content || '').replace(/\0/g, '');
                                    return <div className="whitespace-pre-wrap">{safe}</div>;
                                })()}
                                {msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-indigo-200/20 text-xs opacity-90">
                                        <span className="font-semibold block mb-1">Source:</span>
                                        {msg.citations.map((cite, idx) => (
                                            <div key={idx} className="italic">
                                                "{cite.text}" (Sec {cite.section})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {msg.role === "user" && (
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 mr-auto max-w-[85%]">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg rounded-bl-none flex items-center gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your question..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
