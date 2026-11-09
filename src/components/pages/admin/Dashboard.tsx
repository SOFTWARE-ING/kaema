import { startTransition, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    Calendar, MessageSquare, MessagesSquare, CheckCircle2, XCircle, LogOut, BarChart3, Users, Trash2, Store, ShoppingBag, Eye, Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { RendezVous, Suggestion } from "@/lib/store";
import { ShowroomManager } from "./ShowroomManager";
import { GalleryManager } from "./GalleryManager";
import { apiRequest, ACCESS_TOKEN_KEY } from "@/lib/api";

type Tab = "rdv" | "suggestions" | "chat" | "showroom" | "gallery";
type Conversation = { id: string; name: string; email?: string; messages: Array<{ id: string; from: "client" | "admin"; auteur: string; texte: string; createdAt: number }> };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthorized">("checking");
    const [tab, setTab] = useState<Tab>("rdv");
    const [rdvs, setRdvs] = useState<RendezVous[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [counts, setCounts] = useState({ rdv: 0, pending: 0, suggestions: 0, chat: 0, products: 0, orders: 0, galleryViews: 0, galleryOrders: 0 });
    const [chatReply, setChatReply] = useState<Record<string, string>>({});
    const [error, setError] = useState("");

    const reload = useCallback(async () => {
        const [summary, appointmentRecords, suggestionRecords, conversationRecords] = await Promise.all([
            apiRequest<{ pendingAppointments: number; newOrders: number; suggestions: number; products: number; clients: number; galleryViews: number; galleryOrders: number }>("/api/admin/dashboard", {}, true),
            apiRequest<Array<{ id: string; clientName: string; contact: string; service: string; date: string; slot: string; message: string; channel: string; status: string; createdAt: string }>>("/api/admin/appointments", {}, true),
            apiRequest<Array<{ id: string; author: string; content: string; category: string; _count: { votes: number }; createdAt: string }>>("/api/admin/suggestions", {}, true),
            apiRequest<Array<{ id: string; user: { name: string; email: string } | null; messages: Array<{ id: string; senderRole: string; text: string; createdAt: string }> }>>("/api/admin/conversations", {}, true),
        ]);
        const mappedAppointments = appointmentRecords.map((record): RendezVous => ({
            id: record.id, clientNom: record.clientName, clientContact: record.contact,
            service: record.service, date: record.date.slice(0, 10), creneau: record.slot, message: record.message,
            canal: ({ EMAIL: "mail", WHATSAPP: "whatsapp", CHAT: "chat", WEBSITE: "chat" } as const)[record.channel as "EMAIL" | "WHATSAPP" | "CHAT" | "WEBSITE"],
            statut: ({ PENDING: "en_attente", CONFIRMED: "confirme", CANCELLED: "annule" } as const)[record.status as "PENDING" | "CONFIRMED" | "CANCELLED"],
            createdAt: new Date(record.createdAt).getTime(),
        }));
        const mappedSuggestions = suggestionRecords.map((record): Suggestion => ({
            id: record.id, auteur: record.author, contenu: record.content, categorie: record.category,
            votes: record._count.votes, createdAt: new Date(record.createdAt).getTime(),
        }));
        const mappedConversations = conversationRecords.map((conversation): Conversation => ({
            id: conversation.id, name: conversation.user?.name ?? "Visiteur", email: conversation.user?.email,
            messages: conversation.messages.map((message) => ({
                id: message.id, from: message.senderRole === "ADMIN" ? "admin" : "client",
                auteur: message.senderRole === "ADMIN" ? "KAEMA" : (conversation.user?.name ?? "Visiteur"),
                texte: message.text, createdAt: new Date(message.createdAt).getTime(),
            })),
        }));
        const nextCounts = {
            rdv: mappedAppointments.length, pending: summary.pendingAppointments, suggestions: summary.suggestions,
            chat: mappedConversations.reduce((sum, conversation) => sum + conversation.messages.filter((message) => message.from === "client").length, 0),
            products: summary.products, orders: summary.newOrders, galleryViews: summary.galleryViews, galleryOrders: summary.galleryOrders,
        };
        startTransition(() => {
            setRdvs(mappedAppointments);
            setSuggestions(mappedSuggestions);
            setConversations(mappedConversations);
            setCounts(nextCounts);
        });
        setError("");
    }, []);

    useEffect(() => {
        let active = true;
        apiRequest<{ role: string }>("/api/auth/me", {}, true)
            .then((user) => { if (active) setAuthState(user.role === "ADMIN" ? "authorized" : "unauthorized"); })
            .catch(() => { if (active) setAuthState("unauthorized"); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (authState !== "authorized") return;
        void Promise.resolve().then(reload).catch((cause) => console.error("Chargement du tableau de bord impossible", cause));
        const interval = window.setInterval(() => { reload().catch(() => undefined); }, 8000);
        return () => window.clearInterval(interval);
    }, [authState, reload]);

    const setRdvStatus = async (id: string, statut: RendezVous["statut"]) => {
        const status = ({ en_attente: "PENDING", confirme: "CONFIRMED", annule: "CANCELLED" } as const)[statut];
        try { await apiRequest(`/api/admin/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, true); await reload(); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Le rendez-vous n’a pas pu être modifié."); }
    };

    const deleteRdv = async (id: string) => {
        try { await apiRequest(`/api/admin/appointments/${id}`, { method: "DELETE" }, true); await reload(); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Le rendez-vous n’a pas pu être supprimé."); }
    };

    const deleteSuggestion = async (id: string) => {
        try { await apiRequest(`/api/admin/suggestions/${id}`, { method: "DELETE" }, true); await reload(); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "La suggestion n’a pas pu être supprimée."); }
    };

    const sendReply = async (conversationId: string) => {
        const text = chatReply[conversationId]?.trim();
        if (!text) return;
        try {
            await apiRequest(`/api/admin/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ text }) }, true);
            setChatReply((current) => ({ ...current, [conversationId]: "" }));
            await reload();
        } catch (cause) { setError(cause instanceof Error ? cause.message : "Le message n’a pas pu être envoyé."); }
    };

    if (authState === "checking") return <div className="min-h-screen grid-bg p-8 text-sm text-red-200/70">Vérification de l'accès…</div>;
    if (authState === "unauthorized") return <Navigate to="/admin/login" replace />;

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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            try { await apiRequest("/api/auth/logout", { method: "POST" }); } catch { /* la session locale est révoquée ci-dessous */ }
                            sessionStorage.removeItem(ACCESS_TOKEN_KEY);
                            sessionStorage.removeItem("kaema.role");
                            navigate("/");
                        }}
                    >
                        <LogOut size={14} /> Quitter
                    </Button>
                </div>
            </header>

            {error && <p role="alert" className="mb-4 text-sm text-amber-300">{error}</p>}

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
                <StatCard icon={Calendar} label="RDV" value={counts.rdv} accent="text-amber-400" />
                <StatCard icon={BarChart3} label="En attente" value={counts.pending} accent="text-orange-400" />
                <StatCard icon={MessageSquare} label="Suggestions" value={counts.suggestions} accent="text-red-400" />
                <StatCard icon={MessagesSquare} label="Chats" value={counts.chat} accent="text-emerald-400" />
                <StatCard icon={Store} label="Produits" value={counts.products} accent="text-violet-400" />
                <StatCard icon={ShoppingBag} label="Nouvelles commandes" value={counts.orders} accent="text-pink-400" />
                <StatCard icon={Eye} label="Vues galerie" value={counts.galleryViews} accent="text-cyan-400" />
                <StatCard icon={ImageIcon} label="Demandes galerie" value={counts.galleryOrders} accent="text-rose-400" />
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
                {([
                    ["rdv", "Rendez-vous", Calendar],
                    ["suggestions", "Suggestions", MessageSquare],
                    ["chat", "Chat", MessagesSquare],
                    ["showroom", "Showroom", Store],
                    ["gallery", "Galerie", ImageIcon],
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

            {tab === "chat" && <div className="space-y-3">
                {conversations.length === 0 && <p className="text-xs text-red-200/50 italic">Aucune conversation.</p>}
                {conversations.map((conversation) => <Card key={conversation.id} className="p-4 space-y-3">
                    <div><h2 className="font-semibold text-white">{conversation.name}</h2>{conversation.email && <p className="text-xs text-red-100/50">{conversation.email}</p>}</div>
                    <div className="max-h-72 overflow-y-auto space-y-2">
                        {conversation.messages.map((message) => <div key={message.id} className={`p-2 rounded border text-xs ${message.from === "client" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200/90" : "border-red-500/30 bg-red-500/5 text-red-200/90"}`}>
                            <span className="font-mono uppercase tracking-widest text-[9px] block mb-1 opacity-70">{message.auteur} · {new Date(message.createdAt).toLocaleString("fr-FR")}</span>
                            <p className="whitespace-pre-wrap">{message.texte}</p>
                        </div>)}
                    </div>
                    <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void sendReply(conversation.id); }}>
                        <input className="min-w-0 flex-1 rounded border border-red-500/30 bg-black/40 px-3 py-2 text-sm text-white" value={chatReply[conversation.id] ?? ""} onChange={(event) => setChatReply((current) => ({ ...current, [conversation.id]: event.target.value }))} placeholder="Répondre…" maxLength={4000} />
                        <Button type="submit" disabled={!chatReply[conversation.id]?.trim()}>Envoyer</Button>
                    </form>
                </Card>)}
            </div>}

            {tab === "showroom" && <ShowroomManager />}
            {tab === "gallery" && <GalleryManager />}
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
