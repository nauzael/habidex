import api from "./api";

interface LoginResponse {
  token: string;
  user?: {
    name: string;
    email: string;
  };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("habidex_token");
}

export function getUser(): { name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("habidex_user");
  return raw ? JSON.parse(raw) : null;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  localStorage.setItem("habidex_token", data.token);
  if (data.user) {
    localStorage.setItem("habidex_user", JSON.stringify(data.user));
  }
  return data;
}

export function logout(): void {
  localStorage.removeItem("habidex_token");
  localStorage.removeItem("habidex_user");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
