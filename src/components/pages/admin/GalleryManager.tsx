import { useEffect, useState, type FormEvent } from "react";
import { Eye, Film, Image as ImageIcon, Pencil, ShoppingBag, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
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

const initialForm = { title: "", description: "", category: "Projet", mediaType: "IMAGE" as MediaType, orientation: "LANDSCAPE" as Orientation, published: true };

export function GalleryManager() {
    const [assets, setAssets] = useState<GalleryAsset[]>([]);
    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const { push } = useToast();

    const reload = async () => setAssets(await apiRequest<GalleryAsset[]>("/api/admin/gallery", {}, true));
    useEffect(() => { void Promise.resolve().then(reload).catch(() => setError("La galerie admin est momentanément indisponible.")); }, []);

    const reset = () => { setForm(initialForm); setFile(null); setEditingId(null); setError(""); };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        if (!editingId && !file) { setError("Choisissez une image ou une vidéo à ajouter."); return; }
        if (file && file.size > (form.mediaType === "VIDEO" ? 300 : 8) * 1024 * 1024) { setError(form.mediaType === "VIDEO" ? "La vidéo dépasse la limite de 300 Mo." : "L’image dépasse la limite de 8 Mo."); return; }
        try {
            let mediaPath = editingId ? assets.find((item) => item.id === editingId)?.mediaPath ?? "" : "";
            let mediaType = form.mediaType;
            if (file) {
                const data = new FormData();
                data.append("file", file);
                const uploaded = await apiRequest<{ mediaPath: string; mediaType: MediaType }>("/api/admin/uploads/gallery", { method: "POST", body: data }, true);
                if (uploaded.mediaType !== form.mediaType) throw new Error("Le format du fichier ne correspond pas au type de média choisi.");
                mediaPath = uploaded.mediaPath;
                mediaType = uploaded.mediaType;
            }
            const payload = { ...form, title: form.title.trim(), description: form.description.trim(), category: form.category.trim(), mediaPath, mediaType };
            await apiRequest(editingId ? `/api/admin/gallery/${editingId}` : "/api/admin/gallery", {
                method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload),
            }, true);
            await reload();
            push({ kind: "success", title: editingId ? "Média modifié" : "Média ajouté", message: "La galerie a été mise à jour." });
            reset();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Le média n’a pas pu être enregistré.");
        }
    };

    const edit = (asset: GalleryAsset) => {
        setEditingId(asset.id);
        setForm({ title: asset.title, description: asset.description, category: asset.category, mediaType: asset.mediaType, orientation: asset.orientation, published: asset.published });
        setFile(null);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const remove = async (asset: GalleryAsset) => {
        try {
            await apiRequest(`/api/admin/gallery/${asset.id}`, { method: "DELETE" }, true);
            await reload();
            if (editingId === asset.id) reset();
            push({ kind: "warning", title: "Média supprimé", message: "Le fichier a aussi été retiré du dossier de la galerie." });
        } catch (cause) { push({ kind: "error", title: "Suppression impossible", message: cause instanceof Error ? cause.message : "Réessayez." }); }
    };

    return <div className="space-y-6">
        <Card className="p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Upload size={18} className="text-red-400" /> {editingId ? "Modifier un média" : "Ajouter à la galerie"}</h2>
            <p className="mb-5 mt-1 text-xs text-red-100/50">Images jusqu’à 8 Mo et vidéos jusqu’à 300 Mo : MP4, MOV, AVI, MKV, WebM, MPEG, M4V, 3GP, WMV, FLV et autres formats reconnus. Les vidéos sont converties pour être lues en streaming avec leur orientation portrait ou paysage.</p>
            <form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-xs text-red-200/80">Titre
                    <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required minLength={2} maxLength={120} className="mt-1" />
                </label>
                <label className="text-xs text-red-200/80">Catégorie
                    <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required minLength={2} maxLength={80} className="mt-1" placeholder="Projet, meuble, cuisine…" />
                </label>
                <label className="text-xs text-red-200/80">Type de média
                    <select value={form.mediaType} onChange={(event) => { setForm({ ...form, mediaType: event.target.value as MediaType }); setFile(null); }} className="mt-1 min-h-11 w-full rounded border border-red-500/40 bg-black/60 px-3 text-sm text-red-50">
                        <option value="IMAGE">Image</option><option value="VIDEO">Vidéo</option>
                    </select>
                </label>
                <label className="text-xs text-red-200/80">Orientation
                    <select value={form.orientation} onChange={(event) => setForm({ ...form, orientation: event.target.value as Orientation })} className="mt-1 min-h-11 w-full rounded border border-red-500/40 bg-black/60 px-3 text-sm text-red-50">
                        <option value="LANDSCAPE">Paysage · horizontal</option><option value="PORTRAIT">Portrait · vertical</option>
                    </select>
                </label>
                <label className="text-xs text-red-200/80 sm:col-span-2">{form.mediaType === "VIDEO" ? "Fichier vidéo" : "Fichier image"}
                    <Input type="file" accept={form.mediaType === "VIDEO" ? "video/*,.mp4,.mov,.avi,.mkv,.webm,.mpg,.mpeg,.m4v,.3gp,.3g2,.ogv,.wmv,.asf,.flv,.mts,.m2ts,.ts,.vob,.mxf,.dv,.rm,.rmvb,.divx" : "image/jpeg,image/png,image/webp,image/avif"} onChange={(event) => setFile(event.target.files?.[0] ?? null)} required={!editingId} className="mt-1 file:mr-3 file:rounded file:border-0 file:bg-red-900/70 file:px-3 file:py-1 file:text-red-50" />
                    <span className="mt-1 block text-[11px] text-red-100/40">{file?.name ?? (editingId ? "Laissez vide pour conserver le fichier actuel." : "Choisissez un fichier à envoyer au serveur.")}</span>
                </label>
                <label className="text-xs text-red-200/80 sm:col-span-2">Description
                    <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={2000} rows={3} className="mt-1" />
                </label>
                <label className="flex items-center gap-2 text-xs text-red-200/80 sm:col-span-2"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /> Publier sur le site</label>
                {error && <p role="alert" className="text-sm text-amber-300 sm:col-span-2">{error}</p>}
                <div className="flex gap-2 sm:col-span-2"><Button type="submit">{editingId ? "Enregistrer" : "Ajouter le média"}</Button>{editingId && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}</div>
            </form>
        </Card>

        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">Médias <span className="text-sm text-red-300/50">({assets.length})</span></h2></div>
        {assets.length === 0 ? <p className="text-sm text-red-100/50">La galerie est vide. Ajoutez des images ou des vidéos ci-dessus.</p> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => <Card key={asset.id} className="overflow-hidden">
                <div className={`relative mx-auto overflow-hidden bg-black/50 ${asset.orientation === "PORTRAIT" ? "aspect-[9/16] max-h-72" : "aspect-video"}`}>
                    {asset.mediaType === "VIDEO" ? <video src={resolveAssetUrl(asset.mediaPath)} preload="metadata" muted playsInline className="h-full w-full object-contain" /> : <img src={resolveAssetUrl(asset.mediaPath)} alt={asset.title} className="h-full w-full object-cover" />}
                    <span className="absolute left-2 top-2 rounded border border-red-500/40 bg-black/75 px-2 py-1 text-[10px] uppercase text-red-200">{asset.mediaType === "VIDEO" ? "Vidéo" : "Image"} · {asset.orientation === "PORTRAIT" ? "Portrait" : "Paysage"}</span>
                </div>
                <div className="space-y-3 p-4">
                    <div className="flex justify-between gap-3"><div><h3 className="font-semibold text-white">{asset.title}</h3><p className="text-xs text-red-200/50">{asset.category} · {asset.published ? "Publié" : "Masqué"}</p></div>{asset.mediaType === "VIDEO" ? <Film size={16} className="shrink-0 text-red-300" /> : <ImageIcon size={16} className="shrink-0 text-red-300" />}</div>
                    {asset.description && <p className="line-clamp-2 text-xs text-red-100/60">{asset.description}</p>}
                    <div className="flex gap-4 text-xs text-red-100/60"><span className="flex items-center gap-1"><Eye size={13} /> {asset.viewCount} vues</span><span className="flex items-center gap-1"><ShoppingBag size={13} /> {asset.orderCount} demandes</span></div>
                    <div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => edit(asset)}><Pencil size={12} /> Modifier</Button><Button type="button" size="sm" variant="ghost" aria-label={`Supprimer ${asset.title}`} onClick={() => void remove(asset)}><Trash2 size={12} /></Button></div>
                </div>
            </Card>)}
        </div>}
    </div>;
}
