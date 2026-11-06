import { useStore, type RendezVous, type Suggestion, type ChatMessage } from "@/lib/store";
import { cn } from "@/lib/utils/utils";

export function AdminBadge({ className }: { className?: string }) {
  const [rdvs] = useStore<RendezVous[]>("rdv", []);
  const [suggestions] = useStore<Suggestion[]>("suggestions", []);
  const [messages] = useStore<ChatMessage[]>("chat", []);

  const total =
    rdvs.filter((r) => r.statut === "en_attente").length +
    suggestions.length +
    messages.filter((m) => m.from === "client").length;

  if (total === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full",
        "bg-red-600 text-white text-[10px] font-mono font-bold tracking-wider",
        "shadow-[0_0_12px_rgba(220,38,38,0.8)] animate-pulse",
        className
      )}
    >
      {total > 99 ? "99+" : total}
    </span>
  );
}