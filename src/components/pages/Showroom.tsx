import { startTransition, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircle, Package, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useSEO } from "@/lib/useSEO";
import type { ShowroomProduct } from "@/lib/store";
import { BRAND } from "@/lib/utils/constants";
import { apiRequest, resolveAssetUrl } from "@/lib/api";

const currency = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const minimumDeliveryDays = 5;
const extraDaysPerPiece = 1;

function estimateDelivery(quantity: number) {
    return minimumDeliveryDays + Math.max(0, quantity - 1) * extraDaysPerPiece;
}

function deliveryDate(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export default function Showroom() {
    const [products, setProducts] = useState<ShowroomProduct[]>([]);
    const [selected, setSelected] = useState<ShowroomProduct | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [message, setMessage] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [whatsappOrderUrl, setWhatsappOrderUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const reloadProducts = async () => {
        const records = await apiRequest<Array<ShowroomProduct & { createdAt: string }>>("/api/showroom/products");
        startTransition(() => setProducts(records.map((product) => ({ ...product, createdAt: new Date(product.createdAt).getTime() }))));
    };

    useEffect(() => {
        reloadProducts().catch(() => setError("Le showroom est momentanément indisponible. Réessayez plus tard."));
    }, []);

    useSEO({
        title: "Showroom — KAEMA RÉNO & DESIGN",
        description: "Découvrez les meubles et objets sélectionnés par KAEMA. Commandez directement ou contactez notre vendeur.",
        canonical: "https://kaema-renodesign.cm/showroom",
    });

    const publishedProducts = products.filter((product) => product.published);
    const closeOrder = () => {
        setSelected(null);
        setConfirmation("");
        setWhatsappOrderUrl("");
        setQuantity(1);
        setCustomerName("");
        setCustomerContact("");
        setMessage("");
    };

    const startOrder = (product: ShowroomProduct) => {
        setSelected(product);
        setConfirmation("");
        setWhatsappOrderUrl("");
        setQuantity(1);
    };

    async function submitOrder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selected || !customerName.trim() || !customerContact.trim()) return;
        setLoading(true);
        setError("");
        try {
            const order = await apiRequest<{ total: number; deliveryDays: number; customerName: string; customerContact: string; message: string; productName: string }>("/api/showroom/orders", {
                method: "POST",
                body: JSON.stringify({ productId: selected.id, quantity, customerName: customerName.trim(), customerContact: customerContact.trim(), message: message.trim() }),
            });
            const deliveryDays = order.deliveryDays;
            await reloadProducts();

            const orderText = [
                `Bonjour KAEMA, je souhaite commander : ${order.productName}`,
                `Quantité : ${quantity}`,
                `Prix total : ${currency.format(order.total)} FCFA`,
                `Délai estimatif : ${deliveryDays} jours (à confirmer)`,
                `Nom : ${order.customerName}`,
                `Contact : ${order.customerContact}`,
                order.message ? `Précisions : ${order.message}` : "",
            ].filter(Boolean).join("\n");
            const whatsappNumber = BRAND.whatsapp.replace(/\D/g, "");
            setWhatsappOrderUrl(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`);
            setConfirmation("Votre demande est enregistrée. Envoyez le message WhatsApp au vendeur pour la confirmer.");
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "La commande n’a pas pu être enregistrée.");
        } finally { setLoading(false); }
    }

    const sellerText = encodeURIComponent("Bonjour KAEMA, je souhaite en savoir plus sur les produits du showroom.");
    const sellerNumber = BRAND.whatsapp.replace(/\D/g, "");

    return (
        <div className="min-h-screen min-w-0 grid-bg text-red-50">
            <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-red-500/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-red-300/70 hover:text-red-300">
                        <ArrowLeft size={14} /> Accueil
                    </Link>
                    <span className="font-mono tracking-[0.3em] text-sm text-red-400 text-glow font-bold">KAEMA</span>
                    <a href={`https://wa.me/${sellerNumber}?text=${sellerText}`} target="_blank" rel="noreferrer noopener">
                        <Button size="sm" variant="outline"><MessageCircle size={13} /> Vendeur</Button>
                    </a>
                </div>
            </nav>

            <header className="px-4 sm:px-6 py-14 sm:py-20 border-b border-red-500/20 text-center">
                <div className="max-w-3xl mx-auto">
                    <p className="font-mono text-xs tracking-[0.35em] uppercase text-red-400 mb-3">KAEMA · sélection maison</p>
                    <h1 className="text-4xl sm:text-6xl font-black text-white">Le <span className="text-red-400 text-glow">showroom</span></h1>
                    <p className="mt-4 text-sm sm:text-base text-red-100/70 leading-relaxed">
                        Des pièces choisies avec soin pour donner du caractère à votre intérieur. Consultez les prix, commandez en quelques étapes ou échangez directement avec notre vendeur.
                    </p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                {error && <p role="alert" className="mb-5 text-sm text-amber-300 text-center">{error}</p>}
                {publishedProducts.length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center max-w-2xl mx-auto">
                        <Package size={32} className="mx-auto text-red-400/70 mb-4" />
                        <h2 className="text-xl font-bold text-white">Le showroom se prépare</h2>
                        <p className="mt-2 text-sm text-red-100/60">Nos prochaines pièces seront bientôt disponibles. Vous pouvez déjà échanger avec notre vendeur.</p>
                        <a className="inline-block mt-5" href={`https://wa.me/${sellerNumber}?text=${sellerText}`} target="_blank" rel="noreferrer noopener">
                            <Button><MessageCircle size={14} /> Parler au vendeur</Button>
                        </a>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {publishedProducts.map((product) => (
                            <Card key={product.id} className="overflow-hidden flex flex-col">
                                {product.imageUrl ? (
                                    <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} loading="lazy" className="w-full aspect-4/3 object-cover bg-black/40" />
                                ) : (
                                    <div className="w-full aspect-4/3 bg-red-950/30 flex items-center justify-center"><ShoppingBag size={36} className="text-red-400/40" /></div>
                                )}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-3">
                                        <h2 className="text-lg font-bold text-white">{product.name}</h2>
                                        <span className="text-sm font-bold text-red-300 whitespace-nowrap">{currency.format(product.price)} FCFA</span>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-red-100/65 flex-1">{product.description}</p>
                                    <p className="mt-3 text-xs text-red-300/60">{product.stock > 0 ? `${product.stock} pièce${product.stock > 1 ? "s" : ""} disponible${product.stock > 1 ? "s" : ""}` : "Rupture de stock · contactez le vendeur"}</p>
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Button disabled={product.stock <= 0} onClick={() => startOrder(product)}>
                                            Commander <ArrowRight size={14} />
                                        </Button>
                                        <a href={`https://wa.me/${sellerNumber}?text=${encodeURIComponent(`Bonjour, je souhaite parler avec un vendeur au sujet de : ${product.name}.`)}`} target="_blank" rel="noreferrer noopener">
                                            <Button variant="outline" className="w-full"><MessageCircle size={14} /> Parler au vendeur</Button>
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                <p className="mt-8 text-center text-xs text-red-100/45">Livraison estimée à partir de 5 jours ; le délai exact est confirmé selon la quantité et la disponibilité.</p>
            </main>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeOrder(); }}>
                    <Card className="relative w-full max-w-lg p-4 sm:p-7 max-h-[calc(100dvh-2rem)] overflow-y-auto">
                        <button type="button" onClick={closeOrder} aria-label="Fermer" className="absolute top-3 right-3 p-2 text-red-200/60 hover:text-white"><X size={18} /></button>
                        <h2 className="text-xl font-bold text-white pr-8">Commander {selected.name}</h2>
                        <p className="mt-1 text-sm text-red-100/60">{currency.format(selected.price)} FCFA la pièce</p>
                        {confirmation ? (
                            <div className="mt-5 space-y-4">
                                <p className="text-sm text-emerald-300">{confirmation}</p>
                                <a href={whatsappOrderUrl} target="_blank" rel="noreferrer noopener"><Button variant="outline"><MessageCircle size={14} /> Ouvrir WhatsApp</Button></a>
                                <Button onClick={closeOrder}>Terminer</Button>
                            </div>
                        ) : (
                            <form onSubmit={submitOrder} className="mt-5 space-y-4">
                                <label className="block text-xs text-red-200/80">Nombre de pièces
                                    <Input type="number" min={1} max={selected.stock} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(selected.stock, Number(event.target.value) || 1)))} required className="mt-1" />
                                </label>
                                <div className="rounded border border-red-500/20 bg-black/30 p-3 text-sm text-red-100/70">
                                    Total : <strong className="text-white">{currency.format(selected.price * quantity)} FCFA</strong><br />
                                    Délai estimatif : <strong className="text-white">{estimateDelivery(quantity)} jours minimum</strong> · autour du {deliveryDate(estimateDelivery(quantity))}
                                </div>
                                <p className="text-xs text-red-100/50">Base de 5 jours, puis 1 jour supplémentaire par pièce au-delà de la première. Le vendeur confirme le délai final.</p>
                                <label className="block text-xs text-red-200/80">Votre nom
                                    <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required maxLength={100} className="mt-1" />
                                </label>
                                <label className="block text-xs text-red-200/80">Téléphone ou e-mail
                                    <Input value={customerContact} onChange={(event) => setCustomerContact(event.target.value)} required maxLength={120} className="mt-1" />
                                </label>
                                <label className="block text-xs text-red-200/80">Précisions (facultatif)
                                    <Textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} rows={3} className="mt-1" />
                                </label>
                                <Button type="submit" className="w-full" disabled={loading}><ShoppingBag size={14} /> {loading ? "Enregistrement…" : "Envoyer la commande"}</Button>
                            </form>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
