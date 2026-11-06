import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { AdminBadge } from "@/components/pages/admin/AdminBadge";
import { useSEO } from "@/lib/useSEO";
import { Galerie } from "@/components/landing/Galerie";
import { Temoignages } from "@/components/landing/Temoignages";
import { Footer } from "@/components/layout/Footer";
import {
    ArrowRight, MessageCircle, Phone, Mail, MapPin,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BRAND, WHATSAPP_LINK } from "@/lib/utils/constants";
import { Specialites } from "@/components/landing/Specialites";
import { ShowroomPreview } from "@/components/landing/ShowroomPreview";

// const prestations = [
//     { icon: Hammer, title: "Rénovation", desc: "Transformation complète de vos espaces avec une précision chirurgicale." },
//     { icon: Palette, title: "Design d'intérieur", desc: "Des concepts uniques qui reflètent votre identité et votre élégance." },
//     { icon: Ruler, title: "Aménagement", desc: "Optimisation de chaque mètre carré, pensé pour durer." },
//     { icon: ShieldCheck, title: "Durabilité", desc: "Matériaux nobles et finitions impeccables, conçus pour le temps." },
// ];

export default function Landing() {
    const navigate = useNavigate();
    useSEO({
        title: "KAEMA RÉNO & DESIGN — Rénovation & Design d'intérieur à Yaoundé",
        description: "La passion du détail. KAEMA imagine et transforme vos espaces grâce à la rénovation, au design intérieur et à l’aménagement à Yaoundé.",
        canonical: "https://kaema-renodesign.cm/",
    });

    return (
        <div className="min-h-screen grid-bg text-red-50">
            {/* NAV */}
            <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-red-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <span className="font-mono tracking-[0.3em] text-sm sm:text-base text-red-400 text-glow font-bold">
                        KAEMA
                    </span>
                    <div className="hidden md:flex items-center gap-6 text-xs font-mono tracking-widest uppercase text-red-200/60">
                        <a href="#apropos" className="hover:text-red-300">À propos</a>
                        <a href="#prestations" className="hover:text-red-300">Prestations</a>
                        <Link to="/guide-materiaux" className="hover:text-red-300">Guide matériaux</Link>
                        <a href="#showroom" className="hover:text-red-300">Showroom</a>
                        <a href="#galerie" className="hover:text-red-300">Galerie</a>
                        <a href="#contact" className="hover:text-red-300">Contact</a>
                    </div>
                    <div className="flex items-center justify-end w-full md:w-auto gap-3">
                        <Button size="sm" onClick={() => navigate("/client")}>
                            Espace client
                        </Button>
                        <a
                            href="/admin/login"
                            className="sm:flex  items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono tracking-widest uppercase text-red-400/50 hover:text-red-300 transition-colors"
                        >
                            <Shield size={12} />
                            <AdminBadge />
                        </a>
                    </div>

                </div>
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
                            Yaoundé · Cameroun · Est. 2026
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
                    <Link to="/guide-materiaux" className="shrink-0">
                        <Button variant="outline">Explorer le guide <ArrowRight size={14} /></Button>
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
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-red-100/70">
                        <a href={`tel:${BRAND.phone}`} className="flex items-center gap-2 hover:text-red-300">
                            <Phone size={16} /> {BRAND.phone}
                        </a>
                        <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-red-300">
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