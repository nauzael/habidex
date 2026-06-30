import api from "./api";

interface LoginResponse {
  token: string;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("habidex_token");
}

export function getUser(): { name: string; email: string; role?: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("habidex_user");
  return raw ? JSON.parse(raw) : null;
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("habidex_role");
}

export function storeUserRole(role: string): void {
  localStorage.setItem("habidex_role", role);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  localStorage.setItem("habidex_token", data.token);
  if (data.user) {
    localStorage.setItem("habidex_user", JSON.stringify(data.user));
    if (data.user.role) {
      localStorage.setItem("habidex_role", data.user.role);
    }
  }
  return data;
}

export function logout(): void {
  localStorage.removeItem("habidex_token");
  localStorage.removeItem("habidex_user");
  localStorage.removeItem("habidex_role");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
