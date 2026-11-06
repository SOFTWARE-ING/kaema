import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { AdminBadge } from "@/components/pages/admin/AdminBadge";
import { useSEO } from "@/lib/useSEO";
import { Galerie } from "@/components/landing/Galerie";
import { Temoignages } from "@/components/landing/Temoignages";
import { Footer } from "@/components/layout/Footer";
import {
    ArrowRight, MessageCircle, Phone, Mail, MapPin,
    Shield, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BRAND, WHATSAPP_LINK } from "@/lib/utils/constants";
import { Specialites } from "@/components/landing/Specialites";
import { ShowroomPreview } from "@/components/landing/ShowroomPreview";

const navigationLinks = [
    { label: "À propos", url: "#apropos", route: false },
    { label: "Prestations", url: "#prestations", route: false },
    { label: "Guide matériaux", url: "/guide-materiaux", route: true },
    { label: "Showroom", url: "#showroom", route: false },
    { label: "Galerie", url: "#galerie", route: false },
    { label: "Contact", url: "#contact", route: false },
];

// const prestations = [
//     { icon: Hammer, title: "Rénovation", desc: "Transformation complète de vos espaces avec une précision chirurgicale." },
//     { icon: Palette, title: "Design d'intérieur", desc: "Des concepts uniques qui reflètent votre identité et votre élégance." },
//     { icon: Ruler, title: "Aménagement", desc: "Optimisation de chaque mètre carré, pensé pour durer." },
//     { icon: ShieldCheck, title: "Durabilité", desc: "Matériaux nobles et finitions impeccables, conçus pour le temps." },
// ];

export default function Landing() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    useSEO({
        title: "KAEMA RÉNO & DESIGN — Rénovation & Design d'intérieur à Yaoundé",
        description: "La passion du détail. KAEMA imagine et transforme vos espaces grâce à la rénovation, au design intérieur et à l’aménagement à Yaoundé.",
        canonical: "https://kaema-renodesign.cm/",
    });

    return (
        <div className="min-h-screen min-w-0 grid-bg text-red-50">
            {/* NAV */}
            <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-red-500/30">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center gap-3">
                    <span className="font-mono tracking-[0.3em] text-sm sm:text-base text-red-400 text-glow font-bold">
                        <img
                            className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                            src="/src/assets/kaema-logo.png"
                            alt="Kaema logo"
                        />
                    </span>
                    <div className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6 text-sm font-mono tracking-wide uppercase text-red-200/80">
                        {navigationLinks.map((link) => link.route
                            ? <Link key={link.label} to={link.url} className="hover:text-red-300">{link.label}</Link>
                            : <a key={link.label} href={link.url} className="hover:text-red-300">{link.label}</a>)}
                    </div>
                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        <Button size="sm" className="max-sm:px-2" onClick={() => navigate("/client")}>
                            Espace client
                        </Button>
                        <a
                            href="/admin/login"
                            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono tracking-widest uppercase text-red-400/70 hover:text-red-300 transition-colors"
                        >
                            <Shield size={12} />
                            <AdminBadge />
                        </a>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-11 w-11 p-0 lg:hidden"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={menuOpen}
                            aria-controls="navigation-mobile"
                        >
                            {menuOpen ? <X size={21} /> : <Menu size={21} />}
                        </Button>
                    </div>
                </div>
                {menuOpen && (
                    <div id="navigation-mobile" className="absolute inset-x-0 top-full border-t border-red-500/25 bg-black/95 p-3 shadow-xl backdrop-blur-lg lg:hidden">
                        <nav aria-label="Navigation principale" className="mx-auto grid max-w-7xl grid-cols-2 gap-2 sm:grid-cols-3">
                            {navigationLinks.map((link) => link.route
                                ? <Link key={link.label} to={link.url} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-red-100 hover:bg-red-950/60 hover:text-white">{link.label}</Link>
                                : <a key={link.label} href={link.url} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-red-100 hover:bg-red-950/60 hover:text-white">{link.label}</a>)}
                        </nav>
                    </div>
                )}
            </nav>

            {/* HERO */}
            <section className="relative px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <span className="inline-block px-3 py-1 mb-6 text-[10px] font-mono tracking-[0.4em] uppercase text-red-400 border border-red-500/40 rounded-full bg-red-950/30">
                            Yaoundé · Cameroun . 2026
                        </span>
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                            <span className="text-red-400 text-glow">KAEMA</span>
                            <br />
                            <span className="text-white/90">RÉNO & DESIGN</span>
                        </h1>
                        <p className="mt-6 text-base sm:text-xl text-red-100/70 max-w-2xl mx-auto italic">
                            « {BRAND.slogan} »
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="lg" onClick={() => navigate("/client")}>
                                Prendre rendez-vous <ArrowRight size={16} />
                            </Button>
                            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                    <MessageCircle size={16} /> WhatsApp
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* À PROPOS */}
            <section id="apropos" className="px-4 sm:px-6 py-16 border-t border-red-500/20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-mono text-xs tracking-[0.4em] uppercase text-red-400 mb-4">◆ À propos</h2>
                    <Card className="p-6 sm:p-10 corner-frame">
                        <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                            Des espaces qui vous ressemblent, jusque dans les détails.
                        </h3>
                        <div className="mt-4 space-y-4 text-sm sm:text-base text-red-100/80 leading-relaxed">
                            <p>
                                <span className="text-red-300 font-semibold">KAEMA RÉNO & DESIGN</span> imagine et transforme
                                vos espaces à Yaoundé. De la rénovation au design intérieur et à l’aménagement, chaque projet
                                prend forme à partir de vos envies et de votre façon de vivre.
                            </p>
                            <p>
                                Matières, lignes, lumière, finitions : nous accordons à chaque choix le soin qu’il mérite.
                                Avec une approche attentive et des réalisations pensées pour durer, nous créons des lieux
                                harmonieux, confortables et vraiment à vous; jusque dans les détails.
                            </p>
                        </div>
                    </Card>
                </div>
            </section>

            {/* PRESTATIONS */}
            <Specialites />
            <section className="px-4 sm:px-6 py-12 border-t border-red-500/20">
                <div className="max-w-6xl mx-auto rounded-xl border border-red-500/30 bg-black/35 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-red-400 mb-2">◆ Le guide des matériaux</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Mieux choisir, c’est déjà bien construire.</h2>
                        <p className="mt-2 text-sm text-red-100/60">Compare panneaux, finitions, éclairages, réseaux, solaire et bien plus.</p>
                    </div>
                    <Link to="/guide-materiaux" className="w-full sm:w-auto shrink-0">
                        <Button variant="outline" className="w-full sm:w-auto">Explorer le guide <ArrowRight size={14} /></Button>
                    </Link>
                </div>
            </section>
            <ShowroomPreview />
            <Galerie />
            <Temoignages />

            {/* CONTACT */}
            <section id="contact" className="px-4 sm:px-6 py-16 border-t border-red-500/20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="font-mono text-xs tracking-[0.4em] uppercase text-red-400 mb-6">◆ Contact</h2>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center items-center text-sm text-red-100/70">
                        <a href={`tel:${BRAND.phone}`} className="flex max-w-full items-center gap-2 hover:text-red-300">
                            <Phone size={16} /> {BRAND.phone}
                        </a>
                        <a href={`mailto:${BRAND.email}`} className="flex max-w-full items-center gap-2 break-all hover:text-red-300 sm:break-normal">
                            <Mail size={16} /> {BRAND.email}
                        </a>
                        <span className="flex items-center gap-2"><MapPin size={16} /> {BRAND.address}</span>
                    </div>
                </div>
            </section>
            <Footer />


            {/* FOOTER */}
            <footer className="border-t border-red-500/30 py-6 text-center text-[10px] font-mono tracking-[0.3em] uppercase text-red-500/40">
                KAEMA ◈ RÉNO & DESIGN ◈ {BRAND.year}
            </footer>
        </div>
    );
}