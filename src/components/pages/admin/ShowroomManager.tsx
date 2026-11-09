import { startTransition, useEffect, useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, PackagePlus, Pencil, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { ProductOrder, ShowroomProduct } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { apiRequest, resolveAssetUrl } from "@/lib/api";

const emptyForm = { name: "", description: "", price: "", imageUrl: "", stock: "1" };
const money = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function ShowroomManager() {
    const [products, setProducts] = useState<ShowroomProduct[]>([]);
    const [orders, setOrders] = useState<ProductOrder[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { push } = useToast();

    const reload = async () => {
        const [productRecords, orderRecords] = await Promise.all([
            apiRequest<Array<ShowroomProduct & { createdAt: string }>>("/api/admin/products", {}, true),
            apiRequest<Array<ProductOrder & { createdAt: string; status: string }>>("/api/admin/orders", {}, true),
        ]);
        const nextProducts = productRecords.map((product) => ({ ...product, createdAt: new Date(product.createdAt).getTime() }));
        const nextOrders = orderRecords.map((order) => ({
                ...order,
                createdAt: new Date(order.createdAt).getTime(),
                status: ({ NEW: "nouvelle", CONFIRMED: "confirmee", DELIVERED: "livree", CANCELLED: "annulee" } as const)[order.status as "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED"],
            }));
        startTransition(() => { setProducts(nextProducts); setOrders(nextOrders); });
    };

    useEffect(() => { reload().catch((cause) => push({ kind: "error", title: "Chargement impossible", message: cause instanceof Error ? cause.message : "Réessayez." })); }, [push]);

    const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const price = Number(form.price);
        const stock = Number(form.stock);
        if (!form.name.trim() || !form.description.trim() || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) return;

        try {
            let imageUrl = form.imageUrl.trim();
            if (imageFile) {
                const imageData = new FormData();
                imageData.append("file", imageFile);
                const uploaded = await apiRequest<{ imageUrl: string }>("/api/admin/uploads/products", { method: "POST", body: imageData }, true);
                imageUrl = uploaded.imageUrl;
            }
            const payload = { name: form.name.trim(), description: form.description.trim(), price, imageUrl, stock, ...(editingId ? {} : { published: true }) };
            await apiRequest(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) }, true);
            await reload();
            push(editingId
                ? { kind: "success", title: "Modifications enregistrées", message: "Le produit a été mis à jour." }
                : { kind: "success", title: "Produit publié", message: "Il est maintenant visible dans le showroom." });
        } catch (cause) {
            push({ kind: "error", title: "Enregistrement impossible", message: cause instanceof Error ? cause.message : "Réessayez." });
            return;
        }
        setForm(emptyForm);
        setImageFile(null);
        setEditingId(null);
    };

    const editProduct = (product: ShowroomProduct) => {
        setEditingId(product.id);
        setForm({ name: product.name, description: product.description, price: String(product.price), imageUrl: product.imageUrl, stock: String(product.stock) });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const togglePublished = async (id: string) => {
        const product = products.find((item) => item.id === id);
        if (!product) {
            push({ kind: "error", title: "Produit introuvable", message: "Actualisez la console puis réessayez." });
            return;
        }

        const published = !product.published;
        try {
            await apiRequest(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify({ published }) }, true);
            await reload();
            push(published
                ? { kind: "success", title: "Produit publié", message: "Il est visible dans le showroom." }
                : { kind: "info", title: "Produit masqué", message: "Il n’apparaît plus dans le showroom public." });
        } catch (cause) { push({ kind: "error", title: "Mise à jour impossible", message: cause instanceof Error ? cause.message : "Réessayez." }); }
    };

    const deleteProduct = async (id: string) => {
        try {
            await apiRequest(`/api/admin/products/${id}`, { method: "DELETE" }, true);
            await reload();
            push({ kind: "warning", title: "Produit supprimé", message: "Il a été retiré du showroom." });
        } catch (cause) { push({ kind: "error", title: "Suppression impossible", message: cause instanceof Error ? cause.message : "Réessayez." }); }
        if (editingId === id) {
            setEditingId(null);
            setForm(emptyForm);
        }
    };

    const updateOrderStatus = async (id: string, status: ProductOrder["status"]) => {
        const apiStatus = ({ nouvelle: "NEW", confirmee: "CONFIRMED", livree: "DELIVERED", annulee: "CANCELLED" } as const)[status];
        try {
            await apiRequest(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status: apiStatus }) }, true);
            await reload();
        } catch (cause) { push({ kind: "error", title: "Commande non modifiée", message: cause instanceof Error ? cause.message : "Réessayez." }); }
    };

    return (
        <div className="space-y-8">
            <Card className="p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <PackagePlus size={18} className="text-red-400" /> {editingId ? "Modifier la pièce" : "Ajouter une pièce au showroom"}
                </h2>
                <p className="mt-1 mb-5 text-xs text-red-100/50">Après l’enregistrement, le produit est publié et visible dans le showroom. Vous pourrez le retirer de la vitrine à tout moment. Les images sont stockées sur le serveur; seul leur chemin est conservé en base.</p>
                <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="text-xs text-red-200/80">Nom du produit
                        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={100} className="mt-1" />
                    </label>
                    <label className="text-xs text-red-200/80">Prix (FCFA)
                        <Input type="number" min="1" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required className="mt-1" />
                    </label>
                    <label className="text-xs text-red-200/80">Pièces disponibles
                        <Input type="number" min="0" step="1" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required className="mt-1" />
                    </label>
                    <label className="text-xs text-red-200/80">Image du produit (facultatif)
                        <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="mt-1 file:mr-3 file:rounded file:border-0 file:bg-red-900/70 file:px-3 file:py-1 file:text-red-50" />
                        <span className="mt-1 block text-[11px] text-red-100/40">JPEG, PNG, WebP ou AVIF · 8 Mo maximum{imageFile ? ` · ${imageFile.name}` : form.imageUrl ? " · Image actuelle conservée si aucun nouveau fichier n’est choisi" : ""}</span>
                        {!imageFile && form.imageUrl && <img src={resolveAssetUrl(form.imageUrl)} alt="Image actuelle du produit" className="mt-2 h-16 w-16 rounded object-cover" />}
                    </label>
                    <label className="text-xs text-red-200/80 sm:col-span-2">Description
                        <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required maxLength={1200} rows={4} className="mt-1" />
                    </label>
                    <div className="sm:col-span-2 flex flex-wrap gap-2">
                        <Button type="submit">{editingId ? "Enregistrer les modifications" : "Ajouter le produit"}</Button>
                        {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); setImageFile(null); }}>Annuler</Button>}
                    </div>
                </form>
            </Card>

            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-white">Produits <span className="text-sm text-red-300/50">({products.length})</span></h2>
                </div>
                {products.length === 0 ? <p className="text-sm text-red-100/50">Aucun produit. Ajoutez votre première pièce ci-dessus.</p> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {products.map((product) => (
                            <Card key={product.id} className="min-w-0 p-3 sm:p-4 flex gap-3 sm:gap-4">
                                {product.imageUrl && <img src={resolveAssetUrl(product.imageUrl)} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover bg-black/40 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-red-100">{product.name}</h3>
                                            <p className="text-xs text-red-300 mt-1">{money.format(product.price)} FCFA · Stock : {product.stock}</p>
                                        </div>
                                        <span className={`self-start text-[10px] uppercase tracking-wider ${product.published ? "text-emerald-300" : "text-amber-300"}`}>
                                            {product.published ? "Visible dans le showroom" : "Masqué du showroom"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-red-100/50 line-clamp-2">{product.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <Button type="button" size="sm" variant="outline" onClick={() => togglePublished(product.id)}>
                                            {product.published ? <><EyeOff size={12} /> Masquer du showroom</> : <><Eye size={12} /> Mettre en ligne</>}
                                        </Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => editProduct(product)}><Pencil size={12} /> Modifier</Button>
                                        <Button type="button" size="sm" variant="ghost" onClick={() => deleteProduct(product.id)} aria-label={`Supprimer ${product.name}`}><Trash2 size={12} /></Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><ShoppingBag size={18} className="text-red-400" /> Commandes showroom ({orders.length})</h2>
                {orders.length === 0 ? <p className="text-sm text-red-100/50">Aucune commande pour le moment.</p> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {orders.map((order) => (
                            <Card key={order.id} className="p-4 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-semibold text-red-100">{order.productName} × {order.quantity}</h3>
                                    <span className="text-[10px] uppercase tracking-wider text-amber-300">{order.status}</span>
                                </div>
                                <p className="text-xs text-red-100/70">{order.customerName} · {order.customerContact}</p>
                                <p className="text-xs text-red-300">Total : {money.format(order.total)} FCFA · Délai estimé : {order.deliveryDays} jours</p>
                                {order.message && <p className="text-xs text-red-100/50">« {order.message} »</p>}
                                <p className="text-[10px] text-red-100/40">{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
                                {order.status === "nouvelle" && <div className="flex flex-wrap gap-2 pt-1">
                                    <Button size="sm" variant="primary" onClick={() => updateOrderStatus(order.id, "confirmee")}><Check size={12} /> Confirmer</Button>
                                    <Button size="sm" variant="ghost" onClick={() => updateOrderStatus(order.id, "annulee")}>Annuler</Button>
                                </div>}
                                {order.status === "confirmee" && <div className="flex flex-wrap gap-2 pt-1">
                                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "livree")}>Marquer livrée</Button>
                                    <Button size="sm" variant="ghost" onClick={() => updateOrderStatus(order.id, "annulee")}>Annuler</Button>
                                </div>}
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
