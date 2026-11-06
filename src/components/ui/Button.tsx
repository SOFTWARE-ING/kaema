import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
    "inline-flex min-h-11 items-center justify-center cursor-pointer gap-2 font-mono font-semibold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60",
    {
        variants: {
            variant: {
                primary:
                    "bg-gradient-to-r from-red-600 to-red-800 text-white border border-red-400/40 hover:from-red-500 hover:to-red-700 hover:glow-red shadow-lg shadow-red-900/40",
                ghost:
                    "bg-black/40 text-red-200 border border-red-500/30 hover:border-red-400 hover:bg-red-950/40",
                outline:
                    "bg-transparent text-red-300 border border-red-500/60 hover:bg-red-600/10 hover:text-red-100",
                danger: "bg-red-700 text-white hover:bg-red-600 glow-red",
            },
            size: {
                sm: "px-3 py-1.5 text-[10px] rounded",
                md: "px-5 py-2.5 text-xs rounded-md",
                lg: "px-7 py-3.5 text-sm rounded-md",
            },
        },
        defaultVariants: { variant: "primary", size: "md" },
    }
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

export function Button({ className, variant, size, ...props }: ButtonProps) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}