import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Send, Sparkles, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ChatMessage } from "@/lib/store";
import { apiRequest } from "@/lib/api";

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const reload = useCallback(async () => {
        const result = await apiRequest<{ messages: Array<{ id: string; senderRole: string; text: string; createdAt: string }> }>("/api/client/chat/messages");
        const nextMessages = result.messages.map((message): ChatMessage => ({
            id: message.id,
            from: message.senderRole === "ADMIN" ? "admin" : "client",
            auteur: message.senderRole === "ADMIN" ? "KAEMA" : "Vous",
            texte: message.text,
            createdAt: new Date(message.createdAt).getTime(),
        }));
        startTransition(() => setMessages(nextMessages));
    }, []);

    useEffect(() => {
        reload().catch(() => setError("Impossible de joindre le chat. Vérifiez que l’API est démarrée."));
        const interval = window.setInterval(() => { reload().catch(() => undefined); }, 5000);
        return () => window.clearInterval(interval);
    }, [reload]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        setError("");
        try {
            await apiRequest("/api/client/chat/messages", { method: "POST", body: JSON.stringify({ text: text.trim() }) });
            setText("");
            await reload();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Le message n’a pas pu être envoyé.");
        } finally { setSending(false); }
    };

    return (
        <div className="space-y-4">
            <header>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                    <Sparkles className="text-red-400" /> Chat <span className="text-red-400 text-glow">direct</span>
                </h1>
                <p className="text-xs font-mono tracking-widest uppercase text-red-300/60 mt-2">
                    En ligne · Réponse moyenne &lt; 5 min
                </p>
            </header>

            <Card className="flex flex-col h-[65vh] sm:h-[70vh]">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 && <p className="text-sm text-red-100/50">Bienvenue sur le canal KAEMA. Comment pouvons-nous vous aider aujourd’hui ?</p>}
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === "client"
                                    ? "bg-red-600/30 border border-red-500/50 text-red-50"
                                    : "bg-black/60 border border-red-500/30 text-red-100/90"
                                    }`}
                            >
                                <div className="flex items-center gap-1 mb-1 text-[9px] font-mono tracking-widest uppercase text-red-300/70">
                                    {m.from === "admin" ? <Sparkles size={10} /> : <User size={10} />} {m.auteur}
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">{m.texte}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <form onSubmit={send} className="border-t border-red-500/30 p-3 flex gap-2">
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1"
                        aria-label="Écrivez votre message"
                    />
                    <Button type="submit" disabled={!text.trim() || sending} size="md">
                        <Send size={14} />
                    </Button>
                </form>
            </Card>
            {error && <p role="alert" className="text-sm text-amber-300">{error}</p>}
        </div>
    );
}
