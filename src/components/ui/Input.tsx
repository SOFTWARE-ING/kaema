import { cn } from "@/lib/utils/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                "w-full bg-black/60 border border-red-500/40 rounded px-3 py-2",
                "text-sm text-red-50 font-mono placeholder-red-400/40",
                "focus:outline-none focus:border-red-400 focus:shadow-[0_0_10px_rgba(220,38,38,0.5)]",
                "hover:border-red-400/60 transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "date:[color-scheme:dark]",
                className
            )}
            {...props}
        />
    )
);
Input.displayName = "Input";