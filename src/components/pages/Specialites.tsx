import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SPECIALITES } from "@/lib/specialites";
import { SERVICES } from "@/lib/prestations";
import { useSEO } from "@/lib/useSEO";
import { cn } from "@/lib/utils/utils";

export default function SpecialitesPage() {
    const { hash } = useLocation();

    useSEO({
        title: "Nos prestations — KAEMA RÉNO & DESIGN",
        description:
            "Découvrez les services et spécialités KAEMA : rénovation, design intérieur, aménagement et neuf expertises complémentaires à Yaoundé.",
        canonical: "https://kaema-renodesign.cm/prestations",
    });

    // Scroll vers l'ancre au chargement
    useEffect(() => {
        if (hash) {
            const el = document.getElementById(hash.slice(1));
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
            }
        }
    }, [hash]);

    return (
        <div className="min-h-screen grid-bg text-red-50">
            {/* Nav minimal */}
            <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-red-500/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link
                        to="/#prestations"
                        className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-red-300/70 hover:text-red-300 transition-colors"
                    >
                        <ArrowLeft size={14} /> Prestations
                    </Link>
                    <span className="font-mono tracking-[0.3em] text-sm text-red-400 text-glow font-bold">
                        KAEMA
                    </span>
                    <Link to="/client/rendez-vous">
                        <Button size="sm" variant="primary">RDV</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <header className="px-4 sm:px-6 py-16 sm:py-20 border-b border-red-500/20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight"
                    >
                        Nos <span className="text-red-400 text-glow">prestations</span>
                    </motion.h1>
                    <p className="mt-4 text-sm sm:text-base text-red-100/70 max-w-2xl mx-auto leading-relaxed">
                        Du cadrage de votre projet aux finitions, retrouvez nos services et les spécialités qui nous permettent de le réaliser.
                    </p>
                </div>
            </header>

            {/* Services */}
            <section id="services" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 scroll-mt-20">
                <h2 className="font-mono text-xs tracking-[0.3em] uppercase text-red-400 mb-5">Nos services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SERVICES.map((service, i) => (
                        <motion.div
                            key={service.slug}
                            id={service.slug}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                            className="scroll-mt-24"
                        >
                            <Card className="p-5 h-full">
                                <service.icon size={24} className="text-red-400 mb-4" />
                                <h3 className="text-base font-bold text-white mb-2">{service.titre}</h3>
                                <p className="text-sm text-red-100/70 leading-relaxed">{service.description}</p>
                                <Link to={`/client/rendez-vous?service=${service.slug}`} className="inline-flex items-center gap-1 mt-4 text-xs text-red-300 hover:text-red-200">
                                    Parlons de votre projet <ArrowRight size={12} />
                                </Link>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Spécialités détaillées */}
            <section id="specialites" className="scroll-mt-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-3">
                    <h2 className="font-mono text-xs tracking-[0.3em] uppercase text-red-400">Nos spécialités</h2>
                    <p className="mt-2 text-sm text-red-100/60">Neuf expertises complémentaires pour donner vie à votre projet, jusque dans les détails.</p>
                </div>
                <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
                    {SPECIALITES.map((s, i) => (
                        <motion.section
                            key={s.slug}
                            id={s.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5 }}
                            className="scroll-mt-20"
                        >
                            <Card className="p-5 sm:p-8 hover:border-red-400/40 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                                    {/* Index + icône */}
                                    <div className="flex sm:flex-col items-center sm:items-start gap-3 shrink-0">
                                        <span className="font-mono text-[10px] tracking-widest text-red-400/50">
                                            0{i + 1}
                                        </span>
                                        <div className="w-14 h-14 rounded-lg border border-red-500/30 bg-black/60 flex items-center justify-center">
                                            <s.icon size={26} className={s.couleur} />
                                        </div>
                                    </div>

                                    {/* Contenu */}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg sm:text-2xl font-black text-white mb-2">
                                            {s.titre}
                                        </h2>
                                        <p className="text-sm text-red-100/70 leading-relaxed mb-4">
                                            {s.long}
                                        </p>

                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                                            {s.points.map((p) => (
                                                <li key={p} className="flex items-start gap-2 text-xs text-red-100/80">
                                                    <Check size={12} className={cn("mt-0.5 shrink-0", s.couleur)} />
                                                    <span className="leading-snug">{p}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link to="/client/rendez-vous">
                                            <Button size="sm" variant="outline">
                                                Demander un devis <ArrowRight size={12} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        </motion.section>
                    ))}
                </main>
            </section>

            {/* CTA final */}
            <section className="px-4 sm:px-6 py-16 border-t border-red-500/20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                        Votre projet n'entre dans <span className="text-red-400 text-glow">aucune case</span> ?
                    </h2>
                    <p className="text-sm text-red-100/70 mb-6">
                        Parlons-en. Nous concevons des solutions sur-mesure, même pour les cas les plus complexes.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/client/rendez-vous">
                            <Button size="lg">Prendre rendez-vous</Button>
                        </Link>
                        <Link to="/client/chat">
                            <Button size="lg" variant="outline">Ouvrir le chat</Button>
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-red-500/30 py-6 text-center text-[10px] font-mono tracking-[0.3em] uppercase text-red-500/40">
                KAEMA ◈ RÉNO & DESIGN ◈ 2026
            </footer>
        </div>
    );
}