import { Calendar, MessageSquare, MessagesSquare, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/lib/utils/constants";

const actions = [
    { to: "/client/rendez-vous", icon: Calendar, title: "Prendre RDV", desc: "Réservez un créneau par mail, WhatsApp ou chat." },
    { to: "/client/suggestions", icon: MessageSquare, title: "Suggérer", desc: "Partagez vos idées, accessibles à tous." },
    { to: "/client/chat", icon: MessagesSquare, title: "Chat direct", desc: "Discutez avec l'équipe KAEMA en temps réel." },
];

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Bonjour, <span className="text-red-400 text-glow">Client</span>
                </h1>
                <p className="text-xs font-mono tracking-widest uppercase text-red-300/60 mt-2">
                    {BRAND.slogan}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {actions.map((a) => (
                    <Link key={a.to} to={a.to}>
                        <Card className="p-5 h-full hover:border-red-400/60 hover:glow-red transition-all group">
                            <a.icon size={24} className="text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-sm font-mono tracking-widest uppercase text-red-200 mb-1">{a.title}</h3>
                            <p className="text-xs text-red-100/60">{a.desc}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <Card className="p-6 corner-frame">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-red-400" />
                    <span className="text-xs font-mono tracking-widest uppercase text-red-300">Prochainement</span>
                </div>
                <p className="text-sm text-red-100/70">
                    Historique de vos projets, suivi en temps réel, galerie privée — en préparation.
                </p>
            </Card>
        </div>
    );
}