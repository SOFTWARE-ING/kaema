import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SPECIALITES } from "@/lib/specialites";
import { SERVICES } from "@/lib/prestations";
import { cn } from "@/lib/utils/utils";

export function Specialites() {
    return (
        <section id="prestations" className="px-4 sm:px-6 py-16 border-t border-red-500/20">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 max-w-2xl">
                    <h2 className="font-mono text-xs tracking-[0.4em] uppercase text-red-400 mb-2">
                        ◆ Prestations
                    </h2>
                    <p className="text-2xl sm:text-4xl font-black text-white leading-tight">
                        Un projet, <span className="text-red-400 text-glow">toutes les expertises</span>
                    </p>
                    <p className="text-sm text-red-100/60 mt-3 leading-relaxed">
                        Nos services vous accompagnent de la première idée aux finitions, avec des spécialités complémentaires réunies sous le même toit.
                    </p>
                </div>

                <div className="mb-12">
                    <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-red-300 mb-4">Nos services</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {SERVICES.map((service) => (
                            <Link key={service.slug} to={`/prestations#${service.slug}`} className="block group h-full">
                                <Card className="p-4 h-full hover:border-red-400/60 transition-all">
                                    <service.icon size={22} className="text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-semibold text-red-100 mb-1">{service.titre}</h4>
                                    <p className="text-xs text-red-100/60 leading-relaxed">{service.description}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                <div id="specialites" className="scroll-mt-24">
                    <div className="mb-5">
                        <h3 className="font-mono text-xs tracking-[0.3em] uppercase text-red-300 mb-2">Nos spécialités</h3>
                        <p className="text-sm text-red-100/60">Neuf métiers, de la structure à la finition, pour concrétiser chaque aspect de votre projet.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {SPECIALITES.map((s, i) => (
                            <motion.div
                                key={s.slug}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ delay: (i % 6) * 0.05, duration: 0.4 }}
                            >
                                <Link to={`/prestations#${s.slug}`} className="block group h-full">
                                    <Card className="p-5 h-full flex flex-col hover:border-red-400/60 hover:glow-red transition-all relative overflow-hidden">
                                        {/* halo décor */}
                                        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-red-600/10 blur-2xl group-hover:bg-red-500/20 transition-colors" />

                                        <div className="flex items-start justify-between mb-3">
                                            <s.icon size={26} className={cn(s.couleur, "group-hover:scale-110 transition-transform")} />
                                            <ArrowUpRight
                                                size={16}
                                                className="text-red-400/40 group-hover:text-red-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
                                            />
                                        </div>

                                        <h3 className="font-mono text-sm tracking-widest uppercase text-red-200 mb-1.5">
                                            {s.titre}
                                        </h3>
                                        <p className="text-xs text-red-100/60 leading-relaxed flex-1">
                                            {s.short}
                                        </p>

                                        <ul className="mt-3 pt-3 border-t border-red-500/20 space-y-1">
                                            {s.points.slice(0, 2).map((p) => (
                                                <li key={p} className="flex items-start gap-1.5 text-[10px] text-red-100/50">
                                                    <Check size={10} className="text-red-400 mt-0.5 shrink-0" />
                                                    <span className="leading-snug">{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            to="/prestations"
                            className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-red-300 border border-red-500/40 rounded hover:bg-red-600/10 hover:border-red-400 transition-all"
                        >
                            Découvrir toutes nos prestations <ArrowUpRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}