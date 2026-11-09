const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

export function resolveAssetUrl(path: string) {
  return path.startsWith("/uploads/") ? `${API_URL}${path}` : path;
}

export const ACCESS_TOKEN_KEY = "kaema.accessToken";
const GUEST_KEY = "kaema.guestId";

export function getGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (path.includes("/chat/messages") || path.includes("/suggestions/")) headers.set("X-Kaema-Guest", getGuestId());
  const clientRoute = sessionStorage.getItem("kaema.role") === "CLIENT" && (path === "/api/appointments" || path.startsWith("/api/client/"));
  const requiresAuth = authenticated || clientRoute;
  if (requiresAuth) {
    const token = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  if (response.status === 401 && requiresAuth && path !== "/api/auth/refresh") {
    const refresh = await fetch(`${API_URL}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (refresh.ok) {
      const session = await refresh.json() as { accessToken: string };
      sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
      headers.set("Authorization", `Bearer ${session.accessToken}`);
      response = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Une erreur est survenue.");
  return body as T;
}
