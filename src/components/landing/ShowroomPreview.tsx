import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ShowroomProduct } from "@/lib/store";
import { apiRequest, resolveAssetUrl } from "@/lib/api";

const currency = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export function ShowroomPreview() {
    const [products, setProducts] = useState<ShowroomProduct[]>([]);
    useEffect(() => {
        apiRequest<Array<ShowroomProduct & { createdAt: string }>>("/api/showroom/products")
            .then((items) => setProducts(items.map((item) => ({ ...item, createdAt: new Date(item.createdAt).getTime() }))))
            .catch(() => setProducts([]));
    }, []);
    const featuredProducts = products.filter((product) => product.published).slice(0, 3);

    return (
        <section id="showroom" className="px-4 sm:px-6 py-16 border-t border-red-500/20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
                    <div>
                        <h2 className="font-mono text-xs tracking-[0.4em] uppercase text-red-400 mb-2">◆ Le showroom</h2>
                        <p className="text-2xl sm:text-4xl font-black text-white">Des pièces à <span className="text-red-400 text-glow">adopter</span></p>
                        <p className="mt-2 text-sm text-red-100/60">Découvrez les meubles et objets disponibles à la commande.</p>
                    </div>
                    <Link to="/showroom"><Button variant="outline">Tout le showroom <ArrowRight size={14} /></Button></Link>
                </div>
                {featuredProducts.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredProducts.map((product) => (
                            <Link key={product.id} to="/showroom" className="block group">
                                <Card className="overflow-hidden h-full hover:border-red-400/60 transition-colors">
                                    {product.imageUrl ? <img src={resolveAssetUrl(product.imageUrl)} alt={product.name} loading="lazy" className="w-full aspect-4/3 object-cover bg-black/40 group-hover:scale-[1.02] transition-transform" /> : <div className="aspect-4/3 flex items-center justify-center bg-red-950/30"><ShoppingBag className="text-red-400/50" size={32} /></div>}
                                    <div className="p-4 flex justify-between items-start gap-3">
                                        <div><h3 className="font-semibold text-red-100">{product.name}</h3><p className="mt-1 text-xs text-red-100/50">{product.stock ? `${product.stock} disponible${product.stock > 1 ? "s" : ""}` : "Sur commande"}</p></div>
                                        <span className="text-sm font-bold text-red-300 whitespace-nowrap">{currency.format(product.price)} FCFA</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-sm text-red-100/60">Le showroom se prépare. Les prochaines pièces apparaîtront ici.</p>
                        <Link to="/showroom" className="shrink-0"><Button variant="outline">Visiter le showroom <ArrowRight size={14} /></Button></Link>
                    </Card>
                )}
            </div>
        </section>
    );
}
