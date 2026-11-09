import { useCallback, useEffect, useState } from "react";

/* ---------- Types ---------- */
export type RendezVous = {
  id: string;
  clientNom: string;
  clientContact: string;
  service: string;
  date: string;
  creneau: string;
  message: string;
  canal: "mail" | "whatsapp" | "chat";
  statut: "en_attente" | "confirme" | "annule";
  createdAt: number;
};

export type Suggestion = {
  id: string;
  auteur: string;
  contenu: string;
  categorie: string;
  votes: number;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  from: "client" | "admin";
  auteur: string;
  texte: string;
  createdAt: number;
};

export type ShowroomProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  published: boolean;
  createdAt: number;
};

export type ProductOrder = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
  deliveryDays: number;
  customerName: string;
  customerContact: string;
  message: string;
  status: "nouvelle" | "confirmee" | "livree" | "annulee";
  createdAt: number;
};

/* ---------- Persistance ---------- */
const KEYS = {
  rdv: "kaema.rdv",
  suggestions: "kaema.suggestions",
  chat: "kaema.chat",
  products: "kaema.products",
  orders: "kaema.orders",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("kaema:store", { detail: key }));
}

/* ---------- Hook générique ---------- */
export function useStore<T>(key: keyof typeof KEYS, fallback: T) {
  const [data, setData] = useState<T>(() => read(KEYS[key], fallback));

  useEffect(() => {
    const handler = (e: Event) => {
      const storeKey = KEYS[key];
      const customEvent = e as CustomEvent<string>;
      const storageEvent = e as StorageEvent;
      if (customEvent.detail === storeKey || storageEvent.key === storeKey || storageEvent.key === null) {
        setData(read(storeKey, fallback));
      }
    };
    window.addEventListener("kaema:store", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("kaema:store", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key, fallback]);

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setData((prev) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(KEYS[key], value);
      return value;
    });
  }, [key]);

  return [data, update] as const;
}

/* ---------- Helpers exposés ---------- */
export const uid = () => Math.random().toString(36).slice(2, 10);
