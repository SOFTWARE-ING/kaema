import { cn } from "@/lib/utils/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={cn(
                        "w-full min-h-11 appearance-none bg-black/60 cursor-pointer active:bg-red-900/95 border border-red-500/40 rounded px-3 py-2 pr-9",
                        "text-sm text-red-400 font-mono",
                        "focus:outline-none focus:border-red-400 focus:shadow-[0_0_10px_rgba(220,38,38,0.5)]",
                        "hover:border-red-400/60 transition-all cursor-pointer",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400/70 pointer-events-none"
                />
            </div>
        );
    }
);
Select.displayName = "Select";