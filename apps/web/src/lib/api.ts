export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const TOKEN_KEY = "cardapio_admin_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return undefined as T;
}

export async function apiJson<T = any>(path: string, init: RequestInit = {}) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL não configurado");
  const token = getToken();

  const headers: Record<string, string> = {
    ...(init.headers as any),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  return handleResponse<T>(res);
}

export async function apiForm<T = any>(path: string, init: RequestInit) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL não configurado");
  const token = getToken();

  const headers: Record<string, string> = {
    ...(init.headers as any),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  return handleResponse<T>(res);
}