import { useState, type FormEvent } from "react";
import { Check, Eye, EyeOff, PackagePlus, Pencil, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useStore, uid, type ProductOrder, type ShowroomProduct } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";

const emptyForm = { name: "", description: "", price: "", imageUrl: "", stock: "1" };
const money = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function ShowroomManager() {
    const [products, setProducts] = useStore<ShowroomProduct[]>("products", []);
    const [orders, setOrders] = useStore<ProductOrder[]>("orders", []);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { push } = useToast();

    const saveProduct = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const price = Number(form.price);
        const stock = Number(form.stock);
        if (!form.name.trim() || !form.description.trim() || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) return;

        if (editingId) {
            const existingProduct = products.find((product) => product.id === editingId);
            setProducts((current) => current.map((product) => product.id === editingId
                ? { ...product, name: form.name.trim(), description: form.description.trim(), price, imageUrl: form.imageUrl.trim(), stock }
                : product));
            push({
                kind: "success",
                title: "Modifications enregistrées",
                message: existingProduct?.published ? "Le produit reste visible dans le showroom." : "Le produit reste masqué. Vous pouvez le mettre en ligne depuis sa fiche.",
            });
        } else {
            setProducts((current) => [{
                id: uid(),
                name: form.name.trim(),
                description: form.description.trim(),
                price,
                imageUrl: form.imageUrl.trim(),
                stock,
                published: true,
                createdAt: Date.now(),
            }, ...current]);
            push({ kind: "success", title: "Produit publié", message: "Il est maintenant visible dans le showroom et sur l’accueil." });
        }
        setForm(emptyForm);
        setEditingId(null);
    };

    const editProduct = (product: ShowroomProduct) => {
        setEditingId(product.id);
        setForm({ name: product.name, description: product.description, price: String(product.price), imageUrl: product.imageUrl, stock: String(product.stock) });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const togglePublished = (id: string) => {
        const product = products.find((item) => item.id === id);
        if (!product) {
            push({ kind: "error", title: "Produit introuvable", message: "Actualisez la console puis réessayez." });
            return;
        }

        const published = !product.published;
        setProducts((current) => current.map((item) => item.id === id ? { ...item, published } : item));
        push(published
            ? { kind: "success", title: "Produit publié", message: "Il est visible dans le showroom et sur l’accueil." }
            : { kind: "info", title: "Produit masqué", message: "Il n’apparaît plus dans le showroom public." });
    };

    const deleteProduct = (id: string) => {
        setProducts((current) => current.filter((product) => product.id !== id));
        push({ kind: "warning", title: "Produit supprimé", message: "Il a été retiré du showroom." });
        if (editingId === id) {
            setEditingId(null);
            setForm(emptyForm);
        }
    };

    const updateOrderStatus = (id: string, status: ProductOrder["status"]) =>
        setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));

    return (
        <div className="space-y-8">
            <Card className="p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <PackagePlus size={18} className="text-red-400" /> {editingId ? "Modifier la pièce" : "Ajouter une pièce au showroom"}
                </h2>
                <p className="mt-1 mb-5 text-xs text-red-100/50">Après l’enregistrement, le produit est publié et visible dans le showroom. Vous pourrez le retirer de la vitrine à tout moment. Pour l’image, ajoutez une URL accessible publiquement.</p>
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
                    <label className="text-xs text-red-200/80">URL de l’image (facultatif)
                        <Input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" className="mt-1" />
                    </label>
                    <label className="text-xs text-red-200/80 sm:col-span-2">Description
                        <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required maxLength={1200} rows={4} className="mt-1" />
                    </label>
                    <div className="sm:col-span-2 flex flex-wrap gap-2">
                        <Button type="submit">{editingId ? "Enregistrer les modifications" : "Ajouter le produit"}</Button>
                        {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Annuler</Button>}
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
                                {product.imageUrl && <img src={product.imageUrl} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded object-cover bg-black/40 shrink-0" />}
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
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Button size="sm" variant="primary" onClick={() => updateOrderStatus(order.id, "confirmee")}><Check size={12} /> Confirmer</Button>
                                    <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "livree")}>Livrée</Button>
                                    <Button size="sm" variant="ghost" onClick={() => updateOrderStatus(order.id, "annulee")}>Annuler</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
