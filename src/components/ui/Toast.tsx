import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export type ToastKind = "success" | "error" | "info" | "warning";
export type Toast = { id: string; kind: ToastKind; title: string; message?: string };

type ToastCtx = {
    toasts: Toast[];
    push: (t: Omit<Toast, "id">) => void;
    dismiss: (id: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

const ICONS: Record<ToastKind, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const COLORS: Record<ToastKind, string> = {
    success: "border-emerald-500/50 bg-emerald-950/80 text-emerald-200",
    error: "border-red-500/50 bg-red-950/80 text-red-200",
    info: "border-sky-500/50 bg-sky-950/80 text-sky-200",
    warning: "border-amber-500/50 bg-amber-950/80 text-amber-200",
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback(
        (t: Omit<Toast, "id">) => {
            const id = Math.random().toString(36).slice(2, 9);
            setToasts((prev) => [...prev, { ...t, id }]);
            setTimeout(() => dismiss(id), 4500);
        },
        [dismiss]
    );

    return (
        <Ctx.Provider value={{ toasts, push, dismiss }}>
            {children}
            <div className="fixed top-4 right-4 left-4 sm:left-auto z-100 flex flex-col gap-2 sm:max-w-sm pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => {
                        const Icon = ICONS[t.kind];
                        return (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className={cn(
                                    "pointer-events-auto relative rounded-md border backdrop-blur-md px-4 py-3 shadow-lg",
                                    COLORS[t.kind]
                                )}
                            >
                                <div className="flex items-start gap-3 pr-6">
                                    <Icon size={18} className="mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-mono tracking-widest uppercase font-bold">{t.title}</p>
                                        {t.message && <p className="text-[11px] mt-1 opacity-80 leading-relaxed">{t.message}</p>}
                                    </div>
                                </div>
                                <button
                                    onClick={() => dismiss(t.id)}
                                    className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                                <motion.div
                                    initial={{ width: "100%" }}
                                    animate={{ width: "0%" }}
                                    transition={{ duration: 4.5, ease: "linear" }}
                                    className="absolute bottom-0 left-0 h-0.5 bg-current opacity-40 rounded-bl-md"
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </Ctx.Provider>
    );
}

export function useToast() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
    return ctx;
}