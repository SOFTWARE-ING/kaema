import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Shield } from "lucide-react";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { BRAND } from "@/lib/utils/constants";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-0 border-t border-red-500/30 bg-black/60 backdrop-blur-md">
            {/* Liseré lumineux haut */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Bloc marque */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="font-mono tracking-[0.3em] text-sm text-red-400 text-glow font-black">
                            KAEMA
                        </span>
                        <span className="text-[10px] font-mono tracking-widest uppercase text-red-300/40">
                            RÉNO & DESIGN
                        </span>
                    </div>
                    <p className="text-xs text-red-100/60 italic leading-relaxed">
                        « {BRAND.slogan} »
                    </p>
                    <p className="text-[10px] font-mono tracking-widest uppercase text-red-300/40">
                        Yaoundé · Cameroun · Est. 2026
                    </p>
                </div>

                {/* Navigation */}
                <div>
                    <h4 className="font-mono text-[10px] tracking-[0.4em] uppercase text-red-400 mb-3">
                        ◆ Navigation
                    </h4>
                    <ul className="space-y-2">
                        {[
                            { to: "/", label: "Accueil" },
                            { to: "/#apropos", label: "À propos" },
                            { to: "/prestations", label: "Prestations" },
                            { to: "/guide-materiaux", label: "Guide des matériaux" },
                            { to: "/showroom", label: "Showroom" },
                            { to: "/#galerie", label: "Galerie" },
                            { to: "/client", label: "Espace client" },
                        ].map((l) => (
                            <li key={l.to}>
                                <Link
                                    to={l.to}
                                    className="text-xs text-red-100/60 hover:text-red-300 transition-colors font-mono tracking-wider"
                                >
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="font-mono text-[10px] tracking-[0.4em] uppercase text-red-400 mb-3">
                        ◆ Contact
                    </h4>
                    <ul className="space-y-2 text-xs text-red-100/70">
                        <li>
                            <a
                                href={`tel:${BRAND.phone}`}
                                className="flex items-center gap-2 hover:text-red-300 transition-colors"
                            >
                                <Phone size={12} className="text-red-400/70" /> {BRAND.phone}
                            </a>
                        </li>
                        <li>
                            <a
                                href={`mailto:${BRAND.email}`}
                                className="flex items-center gap-2 hover:text-red-300 transition-colors"
                            >
                                <Mail size={12} className="text-red-400/70" /> {BRAND.email}
                            </a>
                        </li>
                        <li className="flex items-center gap-2">
                            <MapPin size={12} className="text-red-400/70" /> {BRAND.address}
                        </li>
                        <li>
                            <Link
                                to="/admin/login"
                                className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-red-400/40 hover:text-red-300 transition-colors mt-2"
                            >
                                <Shield size={11} /> Admin
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Réseaux sociaux */}
                <div>
                    <h4 className="font-mono text-[10px] tracking-[0.4em] uppercase text-red-400 mb-3">
                        ◆ Nous suivre
                    </h4>
                    <SocialLinks variant="icon" size="md" />
                    <p className="text-[10px] text-red-100/40 mt-3 leading-relaxed">
                        Suivez nos chantiers, coulisses et inspirations en temps réel.
                    </p>
                </div>
            </div>

            {/* Barre basse */}
            <div className="border-t border-red-500/20 px-4 sm:px-6 py-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono tracking-widest uppercase text-red-500/40">
                    <span>KAEMA ◈ RÉNO & DESIGN ◈ {year}</span>
                    <span className="text-center sm:text-right">
                        Fait avec précision à Yaoundé
                    </span>
                </div>
            </div>
        </footer>
    );
}