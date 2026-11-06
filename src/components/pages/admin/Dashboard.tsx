import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    Calendar, MessageSquare, MessagesSquare, CheckCircle2, XCircle, LogOut, BarChart3, Users, Trash2, Store, ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useStore, type RendezVous, type Suggestion, type ChatMessage, type ProductOrder, type ShowroomProduct } from "@/lib/store";
import { AdminBadge } from "./AdminBadge";
import { ShowroomManager } from "./ShowroomManager";

type Tab = "rdv" | "suggestions" | "chat" | "showroom";

export default function AdminDashboard() {
    if (!sessionStorage.getItem("kaema.admin")) return <Navigate to="/admin/login" replace />;

    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>("rdv");
    const [rdvs, setRdvs] = useStore<RendezVous[]>("rdv", []);
    const [suggestions, setSuggestions] = useStore<Suggestion[]>("suggestions", []);
    const [messages] = useStore<ChatMessage[]>("chat", []);
    const [products] = useStore<ShowroomProduct[]>("products", []);
    const [orders] = useStore<ProductOrder[]>("orders", []);

    const stats = useMemo(
        () => ({
            rdv: rdvs.length,
            pending: rdvs.filter((r) => r.statut === "en_attente").length,
            suggestions: suggestions.length,
            chat: messages.filter((m) => m.from === "client").length,
            products: products.length,
            orders: orders.filter((order) => order.status === "nouvelle").length,
        }),
        [rdvs, suggestions, messages, products, orders]
    );

    const setRdvStatus = (id: string, statut: RendezVous["statut"]) =>
        setRdvs((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)));

    const deleteRdv = (id: string) => setRdvs((prev) => prev.filter((r) => r.id !== id));
    const deleteSuggestion = (id: string) => setSuggestions((prev) => prev.filter((s) => s.id !== id));

    return (
        <div className="min-h-screen grid-bg p-4 sm:p-6">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                        Console <span className="text-red-400 text-glow">Admin</span>
                    </h1>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-red-300/60">
                        KAEMA · RÉNO & DESIGN
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <AdminBadge />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { sessionStorage.removeItem("kaema.admin"); navigate("/"); }}
                    >
                        <LogOut size={14} /> Quitter
                    </Button>
                </div>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <StatCard icon={Calendar} label="RDV" value={stats.rdv} accent="text-amber-400" />
                <StatCard icon={BarChart3} label="En attente" value={stats.pending} accent="text-orange-400" />
                <StatCard icon={MessageSquare} label="Suggestions" value={stats.suggestions} accent="text-red-400" />
                <StatCard icon={MessagesSquare} label="Chats" value={stats.chat} accent="text-emerald-400" />
                <StatCard icon={Store} label="Produits" value={stats.products} accent="text-violet-400" />
                <StatCard icon={ShoppingBag} label="Nouvelles commandes" value={stats.orders} accent="text-pink-400" />
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
                {([
                    ["rdv", "Rendez-vous", Calendar],
                    ["suggestions", "Suggestions", MessageSquare],
                    ["chat", "Chat", MessagesSquare],
                    ["showroom", "Showroom", Store],
                ] as const).map(([key, label, Icon]) => (
                    <Button
                        type="button"
                        key={key}
                        onClick={() => setTab(key)}
                        variant="ghost"
                        size="sm"
                        className={`px-3 py-2 text-[10px] sm:text-xs font-mono tracking-widest uppercase rounded border whitespace-nowrap transition-all flex items-center gap-1.5 ${tab === key
                            ? "bg-red-600/20 border-red-400 text-red-300 glow-red"
                            : "bg-black/40 border-red-500/30 text-red-300/60 hover:border-red-400/60"
                            }`}
                    >
                        <Icon size={12} /> {label}
                    </Button>
                ))}
            </div>

            {tab === "rdv" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rdvs.length === 0 && <p className="text-xs text-red-200/50 italic">Aucun rendez-vous.</p>}
                    {rdvs.map((r) => (
                        <motion.div key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Card className="p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-red-200">{r.service}</span>
                                    <span className="text-[9px] font-mono uppercase tracking-widest text-red-300/60">
                                        via {r.canal}
                                    </span>
                                </div>
                                <p className="text-xs text-red-100/70">
                                    <Users size={11} className="inline mr-1" /> {r.clientNom} · {r.clientContact}
                                </p>
                                <p className="text-xs text-red-100/70">
                                    <Calendar size={11} className="inline mr-1" /> {r.date} à {r.creneau}
                                </p>
                                {r.message && <p className="text-xs text-red-200/60 italic">« {r.message} »</p>}
                                <div className="flex items-center gap-2 pt-2">
                                    <Button size="sm" variant="primary" onClick={() => setRdvStatus(r.id, "confirme")}>
                                        <CheckCircle2 size={12} /> Confirmer
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setRdvStatus(r.id, "annule")}>
                                        <XCircle size={12} /> Annuler
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteRdv(r.id)}>
                                        <Trash2 size={12} />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {tab === "suggestions" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestions.length === 0 && <p className="text-xs text-red-200/50 italic">Aucune suggestion.</p>}
                    {suggestions.map((s) => (
                        <Card key={s.id} className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono tracking-widest uppercase text-red-400/80 px-2 py-0.5 border border-red-500/40 rounded">
                                    {s.categorie}
                                </span>
                                <Button type="button" onClick={() => deleteSuggestion(s.id)} variant="ghost" size="sm" className="text-red-400/60 hover:text-red-400" aria-label={`Supprimer la suggestion de ${s.auteur}`}>
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                            <p className="text-sm text-red-50/90">{s.contenu}</p>
                            <p className="text-[10px] text-red-300/50 font-mono uppercase tracking-widest">
                                — {s.auteur} · ▲ {s.votes}
                            </p>
                        </Card>
                    ))}
                </div>
            )}

            {tab === "chat" && (
                <Card className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    {messages.length === 0 && <p className="text-xs text-red-200/50 italic">Aucun message.</p>}
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`p-2 rounded border text-xs ${m.from === "client"
                                ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200/90"
                                : "border-red-500/30 bg-red-500/5 text-red-200/90"
                                }`}
                        >
                            <span className="font-mono uppercase tracking-widest text-[9px] block mb-1 opacity-70">
                                {m.from} · {m.auteur}
                            </span>
                            <p className="whitespace-pre-wrap">{m.texte}</p>
                        </div>
                    ))}
                </Card>
            )}

            {tab === "showroom" && <ShowroomManager />}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <Icon size={18} className={accent} />
                <span className="text-2xl font-black text-white">{value}</span>
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-red-300/60 mt-2">{label}</p>
        </Card>
    );
}