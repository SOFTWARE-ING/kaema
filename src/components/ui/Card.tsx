import { cn } from "@/lib/utils/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "relative rounded-lg cursor-pointer border border-red-500/30 bg-black/40 backdrop-blur-md overflow-hidden",
                "shadow-[0_0_25px_rgba(220,38,38,0.12)]",
                className
            )}
            {...props}
        />
    );
}