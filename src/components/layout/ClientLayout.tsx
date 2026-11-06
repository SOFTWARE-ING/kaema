import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
    LayoutDashboard, Calendar, MessageSquare, MessagesSquare, LogOut, Menu, X, Cpu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/utils";
import { BRAND } from "@/lib/utils/constants";
import { Button } from "@/components/ui/Button";

const links = [
    { to: "/client", label: "Tableau de bord", icon: LayoutDashboard, end: true },
    { to: "/client/rendez-vous", label: "Rendez-vous", icon: Calendar },
    { to: "/client/suggestions", label: "Suggestions", icon: MessageSquare },
    { to: "/client/chat", label: "Chat", icon: MessagesSquare },
];

export default function ClientLayout() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen grid-bg flex flex-col lg:flex-row">
            {/* Topbar mobile */}
            <header className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-black/80 backdrop-blur-md border-b border-red-500/30">
                <Button onClick={() => setOpen(!open)} variant="ghost" size="sm" className="h-10 w-10 p-0 text-red-400" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}>
                    {open ? <X size={22} /> : <Menu size={22} />}
                </Button>
                <span className="font-mono tracking-[0.3em] text-sm text-red-400 text-glow">
                    {BRAND.name}
                </span>
                <Cpu size={20} className="text-red-500/60 animate-pulse" />
            </header>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-black/90 lg:bg-black/50 backdrop-blur-xl",
                    "border-r border-red-500/30 flex flex-col transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="h-16 px-5 flex items-center justify-between border-b border-red-500/20">
                    <span className="font-mono tracking-[0.3em] text-red-400 text-sm text-glow">
                        {BRAND.name}
                    </span>
                    <Button className="lg:hidden h-10 w-10 p-0 text-red-400" variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Fermer le menu">
                        <X size={18} />
                    </Button>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.end}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-mono tracking-widest uppercase transition-all",
                                    isActive
                                        ? "bg-red-600/20 text-red-300 border border-red-500/50 glow-red"
                                        : "text-red-200/60 hover:text-red-200 hover:bg-red-950/30 border border-transparent"
                                )
                            }
                        >
                            <l.icon size={16} /> {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-3 border-t border-red-500/20">
                    <Button
                        onClick={() => navigate("/")}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-300/70 hover:text-red-200 hover:bg-red-950/30"
                    >
                        <LogOut size={16} /> Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Overlay mobile */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/70 z-40 lg:hidden"
                />
            )}

            {/* Main */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}