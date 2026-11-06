import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";

export type Projet = {
    id: string;
    titre: string;
    categorie: "Rénovation" | "Design" | "Aménagement";
    lieu: string;
    image: string;
    description: string;
};

const PROJETS: Projet[] = [
    {
        id: "p1",
        titre: "Villa Bastos",
        categorie: "Design",
        lieu: "Yaoundé · Bastos",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        description: "Réhabilitation complète d'une villa contemporaine, mariage du béton brut et du bois chaleureux.",
    },
    {
        id: "p2",
        titre: "Appartement Odza",
        categorie: "Rénovation",
        lieu: "Yaoundé · Odza",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80",
        description: "Rénovation d'un 120 m² avec optimisation des volumes et création d'un îlot central.",
    },
    {
        id: "p3",
        titre: "Bureau Bastos",
        categorie: "Aménagement",
        lieu: "Yaoundé · Bastos",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        description: "Aménagement d'un open space de 300 m² pensé pour la collaboration et le focus.",
    },
    {
        id: "p4",
        titre: "Loft Nlongkak",
        categorie: "Design",
        lieu: "Yaoundé · Nlongkak",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
        description: "Loft industriel chic avec mezzanine, verrières d'atelier et cuisine sur mesure.",
    },
    {
        id: "p5",
        titre: "Cuisine Essos",
        categorie: "Rénovation",
        lieu: "Yaoundé · Essos",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
        description: "Cuisine fonctionnelle en L avec plan de travail en quartz et rangements optimisés.",
    },
    {
        id: "p6",
        titre: "Suite parentale Mvog-Mbi",
        categorie: "Design",
        lieu: "Yaoundé · Mvog-Mbi",
        image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80",
        description: "Suite parentale épurée, tête de lit sur mesure et dressing intégré.",
    },
];

const CATS = ["Tous", "Rénovation", "Design", "Aménagement"] as const;

export function Galerie() {
    const [filter, setFilter] = useState<(typeof CATS)[number]>("Tous");
    const [active, setActive] = useState<number | null>(null);

    const projets = PROJETS.filter((p) => filter === "Tous" || p.categorie === filter);

    const close = () => setActive(null);
    const next = () => setActive((i) => (i === null ? null : (i + 1) % projets.length));
    const prev = () => setActive((i) => (i === null ? null : (i - 1 + projets.length) % projets.length));

    return (
        <section id="galerie" className="px-4 sm:px-6 py-16 border-t border-red-500/20">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h2 className="font-mono text-xs tracking-[0.4em] uppercase text-red-400 mb-2">◆ Galerie</h2>
                        <p className="text-2xl sm:text-3xl font-black text-white">
                            Nos <span className="text-red-400 text-glow">réalisations</span>
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {CATS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setFilter(c)}
                                className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded border transition-all ${filter === c
                                        ? "bg-red-600/20 border-red-400 text-red-300 glow-red"
                                        : "bg-black/40 border-red-500/30 text-red-300/60 hover:border-red-400/60"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {projets.map((p, i) => (
                            <motion.button
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setActive(i)}
                                className="text-left group"
                            >
                                <Card className="overflow-hidden hover:border-red-400/60 hover:glow-red transition-all">
                                    <div className="aspect-4/3 overflow-hidden relative">
                                        <img
                                            src={p.image}
                                            alt={p.titre}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-black/70 border border-red-500/40 text-red-300 rounded">
                                            {p.categorie}
                                        </span>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-red-100">{p.titre}</p>
                                        <p className="text-[10px] font-mono tracking-widest uppercase text-red-300/60 mt-1 flex items-center gap-1">
                                            <MapPin size={10} /> {p.lieu}
                                        </p>
                                    </div>
                                </Card>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* LIGHTBOX */}
            <AnimatePresence>
                {active !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-90 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={close}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-3xl border border-red-500/40 rounded-lg overflow-hidden bg-black/80"
                        >
                            <img src={projets[active].image} alt={projets[active].titre} className="w-full max-h-[70vh] object-cover" />
                            <button
                                onClick={close}
                                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/70 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={prev}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <div className="p-4 border-t border-red-500/30">
                                <p className="text-[10px] font-mono tracking-widest uppercase text-red-400/80 mb-1">
                                    {projets[active].categorie} · {projets[active].lieu}
                                </p>
                                <h3 className="text-lg font-bold text-white mb-2">{projets[active].titre}</h3>
                                <p className="text-sm text-red-100/70 leading-relaxed">{projets[active].description}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}