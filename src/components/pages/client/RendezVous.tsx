import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, Clock, Mail, MessageCircle, MessagesSquare, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SciFiFrame } from "@/components/ui/SciFiFrame";
import { Field } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { BRAND, WHATSAPP_LINK } from "@/lib/utils/constants";
import { SERVICES } from "@/lib/prestations";
import { useStore, uid, type RendezVous } from "@/lib/store";

const creneaux = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export default function RendezVousPage() {
    const [searchParams] = useSearchParams();
    const initialService = SERVICES.find((service) => service.slug === searchParams.get("service"))?.titre ?? SERVICES[0].titre;
    const [rdvs, setRdvs] = useStore<RendezVous[]>("rdv", []);
    const [form, setForm] = useState({
        nom: "",
        contact: "",
        service: initialService,
        date: "",
        creneau: creneaux[1],
        message: "",
    });
    const [loading, setLoading] = useState<"mail" | "whatsapp" | "chat" | null>(null);
    const { push } = useToast();

    const reset = () =>
        setForm({ nom: "", contact: "", service: initialService, date: "", creneau: creneaux[1], message: "" });

    const buildSummary = () =>
        `RDV KAEMA — ${form.service}\nClient : ${form.nom}\nContact : ${form.contact}\nDate : ${form.date} à ${form.creneau}\nNote : ${form.message || "—"}`;

    const persist = (canal: RendezVous["canal"]): RendezVous => {
        const rdv: RendezVous = {
            id: uid(),
            clientNom: form.nom || "Anonyme",
            clientContact: form.contact,
            service: form.service,
            date: form.date,
            creneau: form.creneau,
            message: form.message,
            canal,
            statut: "en_attente",
            createdAt: Date.now(),
        };
        setRdvs((prev) => [rdv, ...prev]);
        return rdv;
    };

    const isValid = form.nom.trim() && form.contact.trim() && form.date;

    const handleMail = () => {
        if (!isValid) return;
        setLoading("mail");
        persist("mail");
        const subject = encodeURIComponent(`[KAEMA] Demande de RDV — ${form.service}`);
        const body = encodeURIComponent(buildSummary());
        window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
        setTimeout(() => {
            setLoading(null);
            push({ kind: "success", title: "Demande envoyée", message: "Vous recevrez une confirmation par mail." });
            reset();
        }, 600);
    };

    const handleWhatsapp = () => {
        if (!isValid) return;
        setLoading("whatsapp");
        persist("whatsapp");
        window.open(`${WHATSAPP_LINK.split("?")[0]}?text=${encodeURIComponent(buildSummary())}`, "_blank");
        setTimeout(() => {
            setLoading(null);
            push({ kind: "success", title: "Demande enregistrée", message: "Redirection vers WhatsApp." });
            reset();
        }, 600);
    };

    const handleChat = () => {
        if (!isValid) return;
        setLoading("chat");
        persist("chat");
        // Injecte un message système dans le chat
        const key = "kaema.chat";
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const msg = {
            id: uid(),
            from: "client",
            auteur: form.nom,
            texte: `📅 Demande de RDV\n${buildSummary()}`,
            createdAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify([...existing, msg]));
        window.dispatchEvent(new CustomEvent("kaema:store", { detail: key }));
        setTimeout(() => {
            setLoading(null);
            push({ kind: "success", title: "Demande ajoutée au chat", message: "L'équipe vous répondra ici." });
            reset();
        }, 600);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Prendre <span className="text-red-400 text-glow">rendez-vous</span>
                </h1>
                <p className="text-xs font-mono tracking-widest uppercase text-red-300/60 mt-2">
                    Choisissez votre canal : mail · WhatsApp · chat
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* FORM */}
                <SciFiFrame className="lg:col-span-2">
                    <Card className="p-5 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nom complet *">
                                <Input
                                    value={form.nom}
                                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                    placeholder="Jean Dupont"
                                />
                            </Field>
                            <Field label="Contact (mail ou téléphone) *">
                                <Input
                                    value={form.contact}
                                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                                    placeholder="jean@mail.com / +237 ..."
                                />
                            </Field>
                        </div>

                        <Field label="Service">
                            <Select
                                value={form.service}
                                onChange={(e) => setForm({ ...form, service: e.target.value })}
                            >
                                {SERVICES.map((service) => <option key={service.slug}>{service.titre}</option>)}
                            </Select>
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Date *">
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                                    <Input
                                        type="date"
                                        value={form.date}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </Field>
                            <Field label="Créneau">
                                <div className="relative">
                                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                                    <Select
                                        value={form.creneau}
                                        onChange={(e) => setForm({ ...form, creneau: e.target.value })}
                                        className="pl-9"
                                    >
                                        {creneaux.map((c) => <option key={c}>{c}</option>)}
                                    </Select>
                                </div>
                            </Field>
                        </div>

                        <Field label="Message / précisions">
                            <Textarea
                                rows={3}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Décrivez votre projet..."
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                            <Button onClick={handleMail} disabled={!isValid || loading !== null} variant="primary">
                                {loading === "mail" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Mail
                            </Button>
                            <Button onClick={handleWhatsapp} disabled={!isValid || loading !== null} variant="outline">
                                {loading === "whatsapp" ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />} WhatsApp
                            </Button>
                            <Button onClick={handleChat} disabled={!isValid || loading !== null} variant="ghost">
                                {loading === "chat" ? <Loader2 size={16} className="animate-spin" /> : <MessagesSquare size={16} />} Chat
                            </Button>
                        </div>
                        {!isValid && (
                            <p className="text-[10px] font-mono tracking-widest text-red-400/60 uppercase">
                                * Nom, contact et date requis
                            </p>
                        )}
                    </Card>
                </SciFiFrame>

                {/* HISTORIQUE */}
                <Card className="p-4">
                    <h2 className="text-xs font-mono tracking-[0.3em] uppercase text-red-400 mb-3">
                        ◆ Historique ({rdvs.length})
                    </h2>
                    <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
                        {rdvs.length === 0 && (
                            <p className="text-xs text-red-200/50 italic">Aucun rendez-vous pour le moment.</p>
                        )}
                        {rdvs.map((r) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-md border border-red-500/30 bg-black/40 space-y-1"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono text-red-300">{r.service}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest ${statutCls(r.statut)}`}>
                                        {r.statut.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-[11px] text-red-100/70">{r.date} · {r.creneau}</p>
                                <p className="text-[10px] text-red-300/50 uppercase tracking-widest">via {r.canal}</p>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function statutCls(s: RendezVous["statut"]) {
    if (s === "confirme") return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10";
    if (s === "annule") return "text-red-400 border-red-500/50 bg-red-500/10";
    return "text-amber-400 border-amber-500/50 bg-amber-500/10";
}