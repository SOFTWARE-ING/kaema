import { ClipboardCheck, Hammer, LayoutGrid, Paintbrush, type LucideIcon } from "lucide-react";

export type Service = {
  slug: string;
  titre: string;
  description: string;
  icon: LucideIcon;
};

export const SERVICES: Service[] = [
  {
    slug: "renovation-complete",
    titre: "Rénovation complète",
    description: "Transformez votre intérieur ou votre extérieur avec une prise en charge cohérente, de la préparation aux finitions.",
    icon: Hammer,
  },
  {
    slug: "design-interieur",
    titre: "Design d’intérieur",
    description: "Des matières, des couleurs et une ambiance choisies pour créer un lieu harmonieux, confortable et à votre image.",
    icon: Paintbrush,
  },
  {
    slug: "amenagement-espace",
    titre: "Aménagement d’espace",
    description: "Optimisez vos volumes, la circulation et les rangements pour tirer le meilleur parti de chaque espace.",
    icon: LayoutGrid,
  },
  {
    slug: "conseil-audit",
    titre: "Conseil & audit",
    description: "Faites le point sur votre projet, vos priorités et les solutions adaptées avant de vous lancer.",
    icon: ClipboardCheck,
  },
];
