import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSEO } from "@/lib/useSEO";
import { GUIDES_MATERIAUX, SOURCES_GUIDE } from "@/lib/guidesMateriaux";

const categories = ["Tout", ...new Set(GUIDES_MATERIAUX.map((guide) => guide.categorie))];

export default function GuideMateriaux() {
    const [category, setCategory] = useState("Tout");
    const [query, setQuery] = useState("");

    useSEO({
        title: "Guide des matériaux — KAEMA RÉNO & DESIGN",
        description: "Panneaux, placo, staff, peinture, éclairage, réseaux, sécurité, solaire et logiciels : conseils pour choisir les solutions adaptées à votre projet.",
        canonical: "https://kaema-renodesign.cm/guide-materiaux",
    });

    const guides = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase("fr");
        return GUIDES_MATERIAUX.filter((guide) => {
            const matchesCategory = category === "Tout" || guide.categorie === category;
            const searchable = [guide.titre, guide.resume, guide.categorie, guide.conseil,
            ...guide.options.flatMap((option) => [option.nom, option.ideal, option.atout, option.vigilance])]
                .join(" ").toLocaleLowerCase("fr");
            return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
        });
    }, [category, query]);

    return (
        <div className="min-h-screen min-w-0 grid-bg text-red-50">
            <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-red-500/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-red-300/70 hover:text-red-300">
                        <ArrowLeft size={14} /> Accueil
                    </Link>
                    <span className="font-mono tracking-[0.3em] text-sm text-red-400 text-glow font-bold">KAEMA</span>
                    <Link to="/prestations" aria-label="Voir nos prestations">
                        <Button size="sm" variant="outline" className="px-2 sm:px-3"><span className="hidden min-[380px]:inline">Prestations</span><ArrowRight size={14} /></Button>
                    </Link>
                </div>
            </nav>

            <header className="px-4 sm:px-6 py-14 sm:py-20 border-b border-red-500/20">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="font-mono text-xs tracking-[0.35em] uppercase text-red-400 mb-3">Comprendre avant de choisir</p>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
                        Le guide des <span className="text-red-400 text-glow">matériaux</span>
                    </h1>
                    <p className="mt-5 max-w-3xl mx-auto text-base sm:text-lg text-red-100/70 leading-relaxed">
                        Panneaux, finitions, éclairage, électricité, réseaux, sécurité, solaire et outils numériques : repères pratiques pour comparer les options, poser les bonnes questions et choisir selon votre espace, votre usage et votre budget.
                    </p>
                    <div className="mt-7 max-w-xl mx-auto relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher : MDF, LED, solaire, staff…" className="pl-9" aria-label="Rechercher dans le guide des matériaux" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-9 sm:py-12">
                <div className="min-w-0 max-w-full flex gap-2 overflow-x-auto overscroll-x-contain pb-2 mb-8" aria-label="Filtrer par catégorie">
                    {categories.map((item) => (
                        <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
                            className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${category === item ? "border-red-400 bg-red-600/20 text-red-200" : "border-red-500/25 text-red-100/60 hover:border-red-400/60"}`}>
                            {item}
                        </button>
                    ))}
                </div>

                {guides.length ? (
                    <div className="space-y-5">
                        {guides.map((guide) => (
                            <Card key={guide.id} id={guide.id} className="p-4 sm:p-7 scroll-mt-20">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-red-500/30 bg-red-950/30 flex items-center justify-center">
                                        <guide.icon size={20} className="text-red-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-[10px] tracking-[0.16em] sm:tracking-[0.25em] uppercase text-red-400/70">{guide.categorie}</p>
                                        <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">{guide.titre}</h2>
                                        <p className="mt-2 text-base text-red-100/75 leading-relaxed">{guide.resume}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                                    {guide.options.map((option) => (
                                        <div key={option.nom} className="rounded-lg border border-red-500/30 bg-black/40 p-4 sm:p-5">
                                            <h3 className="font-semibold text-red-200">{option.nom}</h3>
                                            <p className="mt-2 text-sm text-red-100/80 leading-relaxed"><span className="text-red-300 font-semibold">À choisir pour : </span>{option.ideal}</p>
                                            <p className="mt-2 text-sm text-red-100/75 leading-relaxed"><Check size={14} className="inline mr-1 text-emerald-400" />{option.atout}</p>
                                            <p className="mt-2 text-sm text-amber-100/80 leading-relaxed"><AlertTriangle size={14} className="inline mr-1 text-amber-400" />{option.vigilance}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/30 p-4 sm:p-5">
                                    <p className="text-sm font-semibold tracking-wide uppercase text-red-300 mb-1">Le conseil KAEMA</p>
                                    <p className="text-base text-red-100/80 leading-relaxed">{guide.conseil}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-8 text-center text-sm text-red-100/60">Aucun conseil ne correspond à cette recherche. Essaie un autre terme ou choisis « Tout ».</Card>
                )}

                <Card className="mt-10 p-4 sm:p-7 border-amber-500/40">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-400" />
                        <div>
                            <h2 className="font-bold text-white">Un guide pour s’orienter, pas un plan d’exécution</h2>
                            <p className="mt-2 text-base text-red-100/75 leading-relaxed">
                                Les références, performances et règles peuvent varier selon le fabricant, le climat, le chantier et la réglementation applicable au Cameroun. Vérifie les fiches techniques et fais valider structure, étanchéité, électricité, solaire et sécurité par des professionnels qualifiés avant achat ou travaux.
                            </p>
                        </div>
                    </div>
                </Card>

                <section className="mt-10">
                    <h2 className="font-mono text-xs tracking-[0.3em] uppercase text-red-400 mb-4">Pour aller plus loin</h2>
                    <ul className="space-y-2">
                        {SOURCES_GUIDE.map((source) => (
                            <li key={source.url}>
                                <a href={source.url} target="_blank" rel="noreferrer noopener" className="text-sm text-red-200/70 hover:text-red-200 underline underline-offset-4">
                                    {source.nom} ↗
                                </a>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-sm text-red-100/65">Les pages de référence sont en anglais et ne remplacent pas les règles ni les notices applicables localement.</p>
                </section>

                <section className="mt-12 rounded-xl border border-red-500/30 bg-black/35 p-5 sm:p-8 text-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Un choix à faire pour votre projet ?</h2>
                    <p className="mt-2 text-base text-red-100/75">Décrivez-nous votre espace et vos priorités : nous vous aiderons à comparer les solutions adaptées.</p>
                    <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3">
                        <Link to="/client/rendez-vous" className="w-full sm:w-auto"><Button className="w-full sm:w-auto">Parler de mon projet <ArrowRight size={14} /></Button></Link>
                        <Link to="/prestations" className="w-full sm:w-auto"><Button className="w-full sm:w-auto" variant="outline">Voir nos prestations</Button></Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-red-500/30 py-6 text-center text-[10px] font-mono tracking-[0.3em] uppercase text-red-500/40">
                KAEMA ◈ RÉNO & DESIGN ◈ Guide des matériaux
            </footer>
        </div>
    );
}
