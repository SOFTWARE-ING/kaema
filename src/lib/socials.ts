import {
  SiFacebook,
  SiGoogle,
  SiInstagram,
  SiTiktok,
  SiWhatsapp,
} from "react-icons/si";
import type { IconType } from "react-icons";

export type Social = {
  key: "tiktok" | "google" | "whatsapp" | "instagram" | "facebook";
  label: string;
  href: string;
  icon: IconType;
  /** classes tailwind pour l'anneau hover, l'icône, le glow */
  ring: string;
  iconColor: string;
  glow: string;
};

export const SOCIALS: Social[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/237653121321?text=Bonjour%20KAEMA%2C%20je%20souhaite%20un%20rendez-vous.",
    icon: SiWhatsapp,
    ring: "hover:border-emerald-400/70",
    iconColor: "text-emerald-400",
    glow: "hover:shadow-[0_0_22px_rgba(16,185,129,0.5)]",
  },
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/kaemareno.design?vrfl=cThzYjc5OXV5cGxt&utm_source=qr",
    icon: SiInstagram,
    ring: "hover:border-pink-400/70",
    iconColor: "text-pink-400",
    glow: "hover:shadow-[0_0_22px_rgba(236,72,153,0.5)]",
  },
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/1C6CtpmSED/?mibextid=wwXIfr",
    icon: SiFacebook,
    ring: "hover:border-sky-400/70",
    iconColor: "text-sky-400",
    glow: "hover:shadow-[0_0_22px_rgba(56,189,248,0.5)]",
  },
  {
    key: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@kaema.reno.design?_r=1&_t=ZS-9B616Z9rsB8",
    icon: SiTiktok,
    ring: "hover:border-red-400/70",
    iconColor: "text-red-400",
    glow: "hover:shadow-[0_0_22px_rgba(220,38,38,0.5)]",
  },
  {
    key: "google",
    label: "Google",
    href: "https://share.google/jk7e4FbMXi8TSeH1o", // remplace par ton vrai lien Google Business
    icon: SiGoogle,
    ring: "hover:border-amber-400/70",
    iconColor: "text-amber-400",
    glow: "hover:shadow-[0_0_22px_rgba(245,158,11,0.5)]",
  },
];