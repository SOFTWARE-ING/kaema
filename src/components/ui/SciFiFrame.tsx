import { cn } from "@/lib/utils/utils";
import type { ReactNode } from "react";

export function SciFiFrame({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("relative corner-frame p-1", className)}>
            {children}
        </div>
    );
}