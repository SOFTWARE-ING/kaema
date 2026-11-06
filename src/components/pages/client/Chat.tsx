import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Send, Sparkles, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStore, uid, type ChatMessage } from "@/lib/store";

const AUTO_REPLIES = [
    "Merci pour votre message ! Un conseiller KAEMA vous répond sous peu.",
    "Bien reçu. Pouvez-vous préciser la pièce concernée ?",
    "Nous prenons note. Un devis détaillé peut être préparé sur demande.",
];

export default function Chat() {
    const [messages, setMessages] = useStore<ChatMessage[]>("chat", [
        {
            id: "welcome",
            from: "admin",
            auteur: "KAEMA",
            texte: "Bienvenue sur le canal KAEMA. Comment pouvons-nous vous aider aujourd'hui ?",
            createdAt: Date.now(),
        },
    ]);
    const [text, setText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const send = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        const msg: ChatMessage = {
            id: uid(),
            from: "client",
            auteur: "Vous",
            texte: text.trim(),
            createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, msg]);
        setText("");

        // Réponse mock après délai
        setTimeout(() => {
            const reply: ChatMessage = {
                id: uid(),
                from: "admin",
                auteur: "KAEMA",
                texte: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
                createdAt: Date.now(),
            };
            setMessages((prev) => [...prev, reply]);
        }, 1200);
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
                    <Button type="submit" disabled={!text.trim()} size="md">
                        <Send size={14} />
                    </Button>
                </form>
            </Card>
        </div>
    );
}