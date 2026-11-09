import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest, ACCESS_TOKEN_KEY } from "@/lib/api";

export default function AdminLogin() {
    const [pass, setPass] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await apiRequest<{ user: { role: string }; accessToken: string }>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: email.trim(), password: pass }),
            });
            if (result.user.role !== "ADMIN") throw new Error("Ce compte ne dispose pas d'un accès administrateur.");
            sessionStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
            sessionStorage.setItem("kaema.role", "ADMIN");
            navigate("/admin");
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Connexion impossible.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4">
            <Card className="p-8 w-full max-w-sm corner-frame">
                <Link to="/" className="mb-6 inline-flex items-center gap-2 text-xs text-red-300/70 hover:text-red-200">
                    <ArrowLeft size={14} /> Retour à l’accueil
                </Link>
                <div className="flex items-center gap-2 mb-6">
                    <Shield size={20} className="text-red-400" />
                    <span className="font-mono text-xs tracking-[0.3em] uppercase text-red-400">Admin</span>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-3">
                        <label className="block space-y-1.5 text-xs text-red-200/80">
                            <span>Adresse e-mail</span>
                            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kaema-renodesign.cm" required />
                        </label>
                        <label className="block space-y-1.5 text-xs text-red-200/80">
                            <span>Mot de passe</span>
                            <Input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mot de passe" aria-label="Mot de passe" required />
                        </label>
                    </div>
                    {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 size={14} className="animate-spin" /> : null}Accéder</Button>
                </form>
            </Card>
        </div>
    );
}
