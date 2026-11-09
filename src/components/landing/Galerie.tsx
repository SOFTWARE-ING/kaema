import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, Film, Image as ImageIcon, Mail, MapPin, MessageCircle, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/lib/utils/constants";
import { apiRequest, resolveAssetUrl } from "@/lib/api";

type MediaType = "IMAGE" | "VIDEO";
type Orientation = "PORTRAIT" | "LANDSCAPE";
type GalleryAsset = {
    id: string;
    title: string;
    description: string;
    category: string;
    mediaType: MediaType;
    mediaPath: string;
    orientation: Orientation;
    published: boolean;
    viewCount: number;
    orderCount: number;
};
type GalleryFilter = "ALL" | MediaType;

const mediaTypeLabel = (type: MediaType) => type === "VIDEO" ? "Vidéo" : "Modèle";

function interestMessage(asset: GalleryAsset) {
    return [
        `Bonjour KAEMA, je suis intéressé(e) par ${asset.mediaType === "IMAGE" ? "ce modèle" : "cette vidéo"} : ${asset.title}.`,
        `Catégorie : ${asset.category}`,
        asset.description ? `Détails : ${asset.description}` : "",
        `Lien : ${resolveAssetUrl(asset.mediaPath)}`,
    ].filter(Boolean).join("\n");
}

function InterestActions({ asset }: { asset: GalleryAsset }) {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const message = interestMessage(asset);
    const trackOrder = () => { void apiRequest(`/api/gallery/${asset.id}/order`, { method: "POST" }).catch(() => undefined); };
    const goToChat = async () => {
        trackOrder();
        try {
            await apiRequest("/api/client/chat/messages", { method: "POST", body: JSON.stringify({ text: message }) });
        } finally { navigate("/client/chat"); }
    };
    const whatsapp = `https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    const email = `mailto:${BRAND.email}?subject=${encodeURIComponent(`Demande · ${asset.title}`)}&body=${encodeURIComponent(message)}`;

    return <div className="mt-3">
        <Button type="button" size="sm" variant="outline" onClick={() => setExpanded((value) => !value)}>
            <ShoppingBag size={13} /> {asset.mediaType === "IMAGE" ? "Commander / intéressé" : "Je suis intéressé"}
        </Button>
        {expanded && <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => void goToChat()}><MessageCircle size={12} /> Chat</Button>
            <a href={whatsapp} target="_blank" rel="noreferrer noopener" onClick={trackOrder}><Button type="button" size="sm" variant="ghost"><MessageCircle size={12} /> WhatsApp</Button></a>
            <a href={email} onClick={trackOrder}><Button type="button" size="sm" variant="ghost"><Mail size={12} /> E-mail</Button></a>
        </div>}
    </div>;
}

function MediaCard({ asset, onOpen }: { asset: GalleryAsset; onOpen: (asset: GalleryAsset) => void }) {
    const ratio = asset.orientation === "PORTRAIT" ? "aspect-[9/16]" : "aspect-video";
    return <div className="min-w-0">
        <button type="button" className="block w-full text-left" onClick={() => onOpen(asset)} aria-label={`Voir ${mediaTypeLabel(asset.mediaType).toLowerCase()} : ${asset.title}`}>
            <Card className="group h-full overflow-hidden transition-all hover:border-red-400/60 hover:glow-red">
                <div className={`${ratio} relative overflow-hidden bg-black/60`}>
                    {asset.mediaType === "VIDEO" ? <video src={resolveAssetUrl(asset.mediaPath)} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <img src={resolveAssetUrl(asset.mediaPath)} alt={asset.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    <span className="absolute left-2 top-2 rounded border border-red-500/40 bg-black/75 px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-red-200">{asset.category}</span>
                    {asset.mediaType === "VIDEO" && <span className="absolute inset-0 flex items-center justify-center bg-black/15"><span className="rounded-full border border-white/60 bg-black/60 px-4 py-2 text-xs text-white">▶ Lire la vidéo</span></span>}
                </div>
                <div className="p-3">
                    <h3 className="text-sm font-semibold text-red-100">{asset.title}</h3>
                    <p className="mt-1 flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-red-200/50"><span className="flex items-center gap-1"><Eye size={11} /> {asset.viewCount}</span><span className="flex items-center gap-1"><ShoppingBag size={11} /> {asset.orderCount}</span><span>{asset.orientation === "PORTRAIT" ? "Portrait" : "Paysage"}</span></p>
                </div>
            </Card>
        </button>
        <InterestActions asset={asset} />
    </div>;
}

export function Galerie({ preview = true, initialFilter = "ALL" }: { preview?: boolean; initialFilter?: GalleryFilter } = {}) {
    const [assets, setAssets] = useState<GalleryAsset[]>([]);
    const [filter, setFilter] = useState<GalleryFilter>(initialFilter);
    const [active, setActive] = useState<GalleryAsset | null>(null);
    const [error, setError] = useState("");
    const viewCounted = useRef(false);

    useEffect(() => {
        apiRequest<GalleryAsset[]>("/api/gallery")
            .then((records) => setAssets(records))
            .catch(() => setError("La galerie est momentanément indisponible."));
    }, []);
    const countView = (asset: GalleryAsset) => {
        if (viewCounted.current) return;
        viewCounted.current = true;
        void apiRequest<{ viewCount: number }>(`/api/gallery/${asset.id}/view`, { method: "POST" })
            .then((result) => setAssets((current) => current.map((item) => item.id === asset.id ? { ...item, viewCount: result.viewCount } : item)))
            .catch(() => undefined);
    };
    const open = (asset: GalleryAsset) => {
        viewCounted.current = false;
        setActive(asset);
        if (asset.mediaType === "IMAGE") countView(asset);
    };
    const close = () => setActive(null);
    const images = assets.filter((asset) => asset.mediaType === "IMAGE");
    const videos = assets.filter((asset) => asset.mediaType === "VIDEO");
    const visible = filter === "ALL" ? assets : assets.filter((asset) => asset.mediaType === filter);
    const imageCards = preview ? images.slice(0, 4) : visible;
    const videoCards = preview ? videos.slice(0, 2) : visible;

    return <section id={preview ? "galerie" : undefined} className={`px-4 sm:px-6 ${preview ? "py-16" : "min-h-screen py-10"} border-t border-red-500/20`}>
        <div className="mx-auto max-w-6xl">
            {!preview && <Link to="/" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-red-300/70 hover:text-red-200"><ArrowLeft size={14} /> Accueil</Link>}
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.4em] text-red-400"><ImageIcon size={14} /> Galerie</h2>
                    <p className="text-2xl font-black text-white sm:text-3xl">Nos <span className="text-red-400 text-glow">réalisations</span></p>
                </div>
                {!preview && <div className="flex flex-wrap gap-2">{([["ALL", "Tout"], ["IMAGE", "Modèles"], ["VIDEO", "Vidéos"]] as const).map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded border px-3 py-2 text-[10px] font-mono uppercase tracking-widest ${filter === value ? "border-red-400 bg-red-600/20 text-red-200" : "border-red-500/30 text-red-300/60"}`}>{label}</button>)}</div>}
            </div>

            {error && <p role="alert" className="mb-4 text-sm text-amber-300">{error}</p>}
            {preview ? <>
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-white">Nos modèles</h3><Link to="/galerie?type=images"><Button type="button" size="sm" variant="outline">+ de modèles <ArrowRight size={13} /></Button></Link></div>
                    {imageCards.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{imageCards.map((asset) => <MediaCard key={asset.id} asset={asset} onOpen={open} />)}</div> : <p className="rounded border border-red-500/20 bg-black/30 p-5 text-sm text-red-100/50">Nos prochaines réalisations seront bientôt publiées.</p>}
                </div>
                <div>
                    <div className="mb-4 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-lg font-bold text-white"><Film size={17} className="text-red-400" /> Nos vidéos</h3><Link to="/galerie?type=videos"><Button type="button" size="sm" variant="outline">+ de vidéos <ArrowRight size={13} /></Button></Link></div>
                    {videoCards.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{videoCards.map((asset) => <MediaCard key={asset.id} asset={asset} onOpen={open} />)}</div> : <p className="rounded border border-red-500/20 bg-black/30 p-5 text-sm text-red-100/50">Les vidéos de nos réalisations arrivent bientôt.</p>}
                </div>
            </> : visible.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map((asset) => <MediaCard key={asset.id} asset={asset} onOpen={open} />)}</div> : <Card className="p-8 text-center text-sm text-red-100/50">Aucun média dans cette catégorie pour le moment.</Card>}
        </div>

        <AnimatePresence>
            {active && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6" onClick={close}>
                <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onClick={(event) => event.stopPropagation()} className="relative max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-lg border border-red-500/40 bg-black/95">
                    <button type="button" onClick={close} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-red-500/40 bg-black/70 text-red-200" aria-label="Fermer"><X size={16} /></button>
                    {active.mediaType === "VIDEO" ? <div className="flex max-h-[78dvh] justify-center bg-black"><video key={active.id} src={resolveAssetUrl(active.mediaPath)} controls autoPlay playsInline preload="metadata" onPlay={() => countView(active)} className={active.orientation === "PORTRAIT" ? "max-h-[78dvh] max-w-[88vw] object-contain" : "max-h-[78dvh] w-full object-contain"} /></div> : <img src={resolveAssetUrl(active.mediaPath)} alt={active.title} className="max-h-[65dvh] w-full bg-black object-contain" />}
                    <div className="border-t border-red-500/30 p-4"><p className="mb-1 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-red-400"><MapPin size={11} /> {active.category} · {active.orientation === "PORTRAIT" ? "Portrait" : "Paysage"}</p><h3 className="text-lg font-bold text-white">{active.title}</h3>{active.description && <p className="mt-2 text-sm leading-relaxed text-red-100/70">{active.description}</p>}<p className="mt-3 flex gap-4 text-xs text-red-200/60"><span className="flex items-center gap-1"><Eye size={13} /> {active.viewCount} vues</span><span className="flex items-center gap-1"><ShoppingBag size={13} /> {active.orderCount} demandes</span></p><InterestActions asset={active} /></div>
                </motion.div>
            </motion.div>}
        </AnimatePresence>
    </section>;
}

export function GalleryPage({ initialFilter }: { initialFilter?: GalleryFilter }) {
    return <div className="min-h-screen grid-bg text-red-50"><Galerie preview={false} initialFilter={initialFilter} /></div>;
}
