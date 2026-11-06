import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const ADMIN_PASS = "kaema2026"; // ⚠️ à déplacer côté serveur plus tard

export default function AdminLogin() {
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pass === ADMIN_PASS) {
            sessionStorage.setItem("kaema.admin", "1");
            navigate("/admin");
        } else {
            setError("Code d'accès invalide.");
        }
    };

    return (
        <div className="min-h-screen grid-bg flex items-center justify-center p-4">
            <Card className="p-8 w-full max-w-sm corner-frame">
                <div className="flex items-center gap-2 mb-6">
                    <Shield size={20} className="text-red-400" />
                    <span className="font-mono text-xs tracking-[0.3em] uppercase text-red-400">Admin</span>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400/60" />
                        <Input
                            type="password"
                            value={pass}
                            onChange={(e) => { setPass(e.target.value); setError(""); }}
                            placeholder="Code d'accès"
                            className="pl-9"
                            aria-label="Code d'accès"
                        />
                    </div>
                    {error && <p className="text-xs text-red-400 font-mono">{error}</p>}
                    <Button type="submit" className="w-full">Accéder</Button>
                </form>
            </Card>
        </div>
    );
}