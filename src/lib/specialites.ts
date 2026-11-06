import {
  Hammer, Wifi, Zap, Paintbrush, Layers, Grid3x3, Droplets, Code2, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type Specialite = {
  slug: string;
  titre: string;
  icon: LucideIcon;
  short: string;
  long: string;
  points: string[];
  couleur: string; // classe tailwind pour l'accent
};

export const SPECIALITES: Specialite[] = [
  {
    slug: "menuiserie-moderne",
    titre: "Menuiserie moderne",
    icon: Hammer,
    short: "Sur-mesure en bois, aluminium et PVC.",
    long: "Portes, fenêtres, dressings, cuisines et mobilier sur-mesure. Nous travaillons le bois massif, l'aluminium et le PVC avec la même exigence : précision au millimètre et finitions durables.",
    points: [
      "Mobilier sur-mesure (cuisines, dressings, bibliothèques)",
      "Menuiserie aluminium & PVC (baies vitrées, portes)",
      "Ébénisterie fine et placages nobles",
      "Pose et ajustement garantis",
    ],
    couleur: "text-amber-400",
  },
  {
    slug: "reseaux-telecoms-securite",
    titre: "Réseaux & Télécoms / Sécurité",
    icon: Wifi,
    short: "Connectivité et protection, pensées pour durer.",
    long: "Câblage structuré, réseaux domestiques et professionnels, vidéosurveillance, alarmes et contrôle d'accès. Nous concevons des installations fiables, évolutives et discrètes.",
    points: [
      "Câblage réseau structuré (cuivre & fibre)",
      "Vidéosurveillance IP et analogique",
      "Alarmes anti-intrusion et contrôle d'accès",
      "Interphonie et domotique de base",
    ],
    couleur: "text-sky-400",
  },
  {
    slug: "electricite",
    titre: "Électricité",
    icon: Zap,
    short: "Installations sûres, conformes et durables.",
    long: "De la mise aux normes à l'installation complète, nous traitons chaque circuit avec rigueur : tableaux, éclairage, prises, groupes électrogènes et énergie solaire.",
    points: [
      "Mise aux normes et tableaux électriques",
      "Éclairage architectural et scénographique",
      "Installation de groupes électrogènes",
      "Solutions solaires (onduleurs, batteries)",
    ],
    couleur: "text-yellow-400",
  },
  {
    slug: "peinture-enduit",
    titre: "Peinture & Enduit",
    icon: Paintbrush,
    short: "Finitions impeccables, intérieures et extérieures.",
    long: "Enduits traditionnels et décoratifs, peintures mates, satinées, velours ou à effets. Chaque surface est préparée avec soin pour un rendu homogène et durable.",
    points: [
      "Enduits lisses, talochés et décoratifs",
      "Peintures intérieures et façades",
      "Béton ciré et effets matière",
      "Préparation rigoureuse des supports",
    ],
    couleur: "text-rose-400",
  },
  {
    slug: "staff-placo",
    titre: "Staff & Placo-plâtre",
    icon: Layers,
    short: "Volumes, courbes et jeux de lumière.",
    long: "Faux plafonds, corniches, niches, cloisons et habillages en staff ou plaques de plâtre. Nous dessinons la lumière et les volumes pour sublimer chaque pièce.",
    points: [
      "Faux plafonds et caissons lumineux",
      "Corniches, moulures et rosaces",
      "Cloisons et doublages isolants",
      "Niches, bibliothèques et habillages TV",
    ],
    couleur: "text-orange-400",
  },
  {
    slug: "carrelage",
    titre: "Carrelage",
    icon: Grid3x3,
    short: "Sols et murs, pose précise et alignée.",
    long: "Carrelage, faïence, mosaïque, grands formats et pierre naturelle. La pose est millimétrée : joints alignés, niveaux parfaits, durabilité éprouvée.",
    points: [
      "Carrelage sol et mur, intérieur & extérieur",
      "Grands formats et pierres naturelles",
      "Mosaïques et faïences décoratives",
      "Pose droite, diagonale et chevron",
    ],
    couleur: "text-emerald-400",
  },
  {
    slug: "plomberie",
    titre: "Plomberie",
    icon: Droplets,
    short: "Eau maîtrisée, sanitaires fiables.",
    long: "Alimentation, évacuation, sanitaires, chauffe-eau et traitement d'eau. Chaque installation est testée et pensée pour éviter les fuites et les pertes de charge.",
    points: [
      "Alimentation et évacuation (PPR, PEX, PVC)",
      "Salles de bain et cuisines complètes",
      "Chauffe-eau électriques et solaires",
      "Recherche de fuites et rénovation",
    ],
    couleur: "text-cyan-400",
  },
  {
    slug: "logiciels-sur-mesure",
    titre: "Logiciels sur mesure",
    icon: Code2,
    short: "Applications métier et outils dédiés.",
    long: "Nous concevons des logiciels adaptés à votre activité : gestion de chantiers, suivi client, devis automatisés, tableaux de bord. Développement web et mobile sur-mesure.",
    points: [
      "Applications web (React, Next.js)",
      "Applications mobiles (iOS/Android)",
      "Tableaux de bord et automatisations",
      "Intégrations API et outils métier",
    ],
    couleur: "text-violet-400",
  },
  {
    slug: "finitions-durables",
    titre: "Finitions durables",
    icon: ShieldCheck,
    short: "Le détail qui fait la différence.",
    long: "Raccords, plinthes, joints, traitements de surface et garanties. Nous ne livrons jamais un chantier sans vérifier chaque finition, chaque alignement, chaque détail.",
    points: [
      "Contrôle qualité multi-étapes",
      "Plinthes, corniches et raccords soignés",
      "Traitements hydrofuges et anti-humidité",
      "Garanties post-chantier",
    ],
    couleur: "text-red-400",
  },
];