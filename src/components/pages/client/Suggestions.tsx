import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ThumbsUp, Send, Lightbulb, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useStore, uid, type Suggestion } from "@/lib/store";

const categories = ["Tous", "Design", "Rénovation", "Service", "Autre"];

export default function Suggestions() {
    const [suggestions, setSuggestions] = useStore<Suggestion[]>("suggestions", []);
    const [filter, setFilter] = useState("Tous");
    const [form, setForm] = useState({ auteur: "", contenu: "", categorie: "Design" });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.contenu.trim()) return;
        const s: Suggestion = {
            id: uid(),
            auteur: form.auteur.trim() || "Anonyme",
            contenu: form.contenu.trim(),
            categorie: form.categorie,
            votes: 0,
            createdAt: Date.now(),
        };
        setSuggestions((prev) => [s, ...prev]);
        setForm({ auteur: "", contenu: "", categorie: "Design" });
    };

    const vote = (id: string) => {
        setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s)));
    };

    const visible = useMemo(
        () => suggestions.filter((s) => filter === "Tous" || s.categorie === filter),
        [suggestions, filter]
    );

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                    <Lightbulb className="text-red-400" /> Boîte à <span className="text-red-400 text-glow">suggestions</span>
                </h1>
                <p className="text-xs font-mono tracking-widest uppercase text-red-300/60 mt-2">
                    Ouverte à tous · Votez pour vos idées favorites
                </p>
            </header>

            {/* FORMULAIRE */}
            <Card className="p-5 sm:p-6">
                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            value={form.auteur}
                            onChange={(e) => setForm({ ...form, auteur: e.target.value })}
                            placeholder="Votre nom (optionnel)"
                            aria-label="Votre nom (optionnel)"
                        />
                        <Select
                            value={form.categorie}
                            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                            aria-label="Catégorie de la suggestion"
                        >
                            {categories.filter((c) => c !== "Tous").map((c) => <option key={c}>{c}</option>)}
                        </Select>
                        <Button type="submit" disabled={!form.contenu.trim()}>
                            <Send size={14} /> Publier
                        </Button>
                    </div>
                    <Textarea
                        rows={3}
                        value={form.contenu}
                        onChange={(e) => setForm({ ...form, contenu: e.target.value })}
                        placeholder="Partagez votre idée, suggestion ou retour d'expérience..."
                        aria-label="Votre suggestion"
                    />
                </form>
            </Card>

            {/* FILTRES */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-red-400/60" />
                {categories.map((c) => (
                    <Button
                        type="button"
                        key={c}
                        onClick={() => setFilter(c)}
                        variant="ghost"
                        size="sm"
                        className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded border transition-all ${filter === c
                            ? "bg-red-600/20 border-red-400 text-red-300"
                            : "bg-black/40 border-red-500/30 text-red-300/60 hover:border-red-400/60"
                            }`}
                    >
                        {c}
                    </Button>
                ))}
            </div>

            {/* LISTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                    {visible.map((s) => (
                        <motion.div
                            key={s.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <Card className="p-4 hover:border-red-400/60 transition-colors">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <span className="text-[10px] font-mono tracking-widest uppercase text-red-400/80 px-2 py-0.5 border border-red-500/40 rounded">
                                        {s.categorie}
                                    </span>
                                    <Button
                                        type="button"
                                        onClick={() => vote(s.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1 text-xs text-red-300/70 hover:text-red-300 transition-colors"
                                        aria-label={`Voter pour la suggestion de ${s.auteur}`}
                                    >
                                        <ThumbsUp size={13} /> {s.votes}
                                    </Button>
                                </div>
                                <p className="text-sm text-red-50/90 leading-relaxed">{s.contenu}</p>
                                <p className="text-[10px] text-red-300/50 mt-2 font-mono uppercase tracking-widest">
                                    — {s.auteur}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {visible.length === 0 && (
                    <p className="text-xs text-red-200/50 italic col-span-full">
                        Aucune suggestion dans cette catégorie. Soyez le premier !
                    </p>
                )}
            </div>
        </div>
    );
}
