import { motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";

const AVIS = [
    { nom: "Aïcha N.", role: "Propriétaire, Bastos", texte: "Un travail d'orfèvre. Chaque détail a été pensé, KAEMA a transformé notre maison.", note: 5 },
    { nom: "Serge M.", role: "Gérant, Odza", texte: "Délais respectés, finitions impeccables. Le slogan n'est pas un vain mot.", note: 5 },
    { nom: "Clarisse T.", role: "Architecte, Yaoundé", texte: "Collaboration fluide, une équipe rigoureuse et créative. Je recommande vivement.", note: 5 },
];

export function Temoignages() {
    return (
        <section className="px-4 sm:px-6 py-16 border-t border-red-500/20">
            <div className="max-w-6xl mx-auto">
                <h2 className="font-mono text-xs tracking-[0.4em] uppercase text-red-400 mb-6">◆ Témoignages</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {AVIS.map((a, i) => (
                        <motion.div
                            key={a.nom}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-5 h-full relative">
                                <Quote size={22} className="text-red-500/40 mb-3" />
                                <p className="text-sm text-red-100/80 leading-relaxed italic">« {a.texte} »</p>
                                <div className="flex gap-0.5 mt-3">
                                    {Array.from({ length: a.note }).map((_, idx) => (
                                        <Star key={idx} size={12} className="fill-red-400 text-red-400" />
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-red-500/20">
                                    <p className="text-sm font-semibold text-red-200">{a.nom}</p>
                                    <p className="text-[10px] font-mono tracking-widest uppercase text-red-300/60">{a.role}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}