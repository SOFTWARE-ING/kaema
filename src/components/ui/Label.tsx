import { cn } from "@/lib/utils/utils";

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <label className={cn("block", className)}>
            <span className="block text-[10px] font-mono tracking-widest uppercase text-red-300/70 mb-1">
                {label}
            </span>
            {children}
        </label>
    );
}