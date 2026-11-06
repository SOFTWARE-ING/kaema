import { motion } from "motion/react";
import { cn } from "@/lib/utils/utils";
import { SOCIALS } from "@/lib/socials";

type Props = {
    variant?: "icon" | "chip" | "text";
    size?: "sm" | "md" | "lg";
    className?: string;
    showLabels?: boolean;
    onDark?: boolean;
};

export function SocialLinks({
    variant = "icon",
    size = "md",
    className,
    showLabels = false,
}: Props) {
    const dims = size === "sm" ? 32 : size === "lg" ? 48 : 40;
    const iconSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

    if (variant === "chip") {
        return (
            <div className={cn("flex flex-wrap items-center gap-2", className)}>
                {SOCIALS.map((s, i) => (
                    <motion.a
                        key={s.key}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={s.label}
                        title={s.label}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border bg-black/40",
                            "border-red-500/30 text-red-100/70 transition-all",
                            "hover:bg-red-950/40",
                            s.ring,
                            s.glow
                        )}
                    >
                        <s.icon size={14} className={s.iconColor} />
                        {showLabels && (
                            <span className="text-[10px] font-mono tracking-widest uppercase">
                                {s.label}
                            </span>
                        )}
                    </motion.a>
                ))}
            </div>
        );
    }

    if (variant === "text") {
        return (
            <div className={cn("flex flex-col gap-2", className)}>
                {SOCIALS.map((s) => (
                    <a
                        key={s.key}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-red-100/60 hover:text-red-200 transition-colors"
                    >
                        <s.icon size={14} className={cn(s.iconColor, "group-hover:scale-110 transition-transform")} />
                        <span>{s.label}</span>
                        <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-red-400">↗</span>
                    </a>
                ))}
            </div>
        );
    }

    // variant === "icon"
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {SOCIALS.map((s, i) => (
                <motion.a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    title={s.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    style={{ width: dims, height: dims }}
                    className={cn(
                        "flex items-center justify-center rounded-full border bg-black/40",
                        "border-red-500/30 text-red-100/70 transition-all",
                        "hover:bg-red-950/40",
                        s.ring,
                        s.glow
                    )}
                >
                    <s.icon size={iconSize} className={s.iconColor} />
                </motion.a>
            ))}
        </div>
    );
}