import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest, ACCESS_TOKEN_KEY } from "@/lib/api";

type AuthResult = { user: { role: string }; accessToken: string };

export default function ClientLogin() {
    const navigate = useNavigate();
    const [register, setRegister] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await apiRequest<AuthResult>(register ? "/api/auth/register" : "/api/auth/login", {
                method: "POST",
                body: JSON.stringify(register ? { name, phone: phone || undefined, email, password } : { email, password }),
            });
            if (result.user.role !== "CLIENT") throw new Error("Utilisez la page de connexion administrateur.");
            sessionStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
            sessionStorage.setItem("kaema.role", "CLIENT");
            navigate("/client");
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Connexion impossible.");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4">
            <Card className="p-6 sm:p-8 w-full max-w-md corner-frame">
                <Link to="/" className="inline-flex items-center gap-2 text-xs text-red-300/70 hover:text-red-200 mb-6"><ArrowLeft size={14} /> Retour à l’accueil</Link>
                <div className="flex items-center gap-2 mb-2"><UserRound size={20} className="text-red-400" /><h1 className="font-mono text-sm tracking-[0.25em] uppercase text-red-300">{register ? "Créer un compte" : "Connexion client"}</h1></div>
                <p className="text-xs text-red-100/55 mb-6">Retrouvez vos demandes de rendez-vous et échangez avec l’équipe KAEMA.</p>
                <form onSubmit={submit} className="space-y-4">
                    {register && <>
                        <label className="block space-y-1.5 text-xs text-red-200/80">Nom complet<Input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required minLength={2} maxLength={120} /></label>
                        <label className="block space-y-1.5 text-xs text-red-200/80">Téléphone (facultatif)<Input value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" maxLength={40} /></label>
                    </>}
                    <label className="block space-y-1.5 text-xs text-red-200/80">Adresse e-mail<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} /></label>
                    <label className="block space-y-1.5 text-xs text-red-200/80"><span className="inline-flex items-center gap-1.5"><LockKeyhole size={12} /> Mot de passe</span><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={register ? "new-password" : "current-password"} required minLength={register ? 12 : 1} maxLength={128} /></label>
                    {register && <p className="text-[11px] text-red-100/45">Au moins 12 caractères.</p>}
                    {error && <p role="alert" className="text-sm text-amber-300">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 size={14} className="animate-spin" />}{register ? "Créer mon compte" : "Se connecter"}</Button>
                </form>
                <button type="button" onClick={() => { setRegister((value) => !value); setError(""); }} className="mt-5 text-xs text-red-300/70 hover:text-red-200 underline underline-offset-4">
                    {register ? "J’ai déjà un compte" : "Créer un compte client"}
                </button>
            </Card>
        </div>
    );
}
