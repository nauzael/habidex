"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("jose@lasacacias.co");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Credenciales inválidas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-6 pb-7 pt-6 text-white">
      {/* Brand */}
      <div className="mb-9 mt-5 flex items-center gap-3 font-display text-xl font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-terracota-500 font-extrabold">
          H
        </span>
        <span>Habidex</span>
      </div>

      {/* Title */}
      <h1 className="mb-2 font-display text-[32px] font-bold leading-[1.15] tracking-tight">
        Bienvenido de vuelta, Don José
      </h1>
      <p className="mb-7 text-[15px] text-white/70">
        Gestiona tu hotel desde cualquier lugar. Tienes 12 check-ins programados hoy.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-white/85" htmlFor="email">
            Correo electrónico
          </label>
          <div className="relative flex items-center">
            <Mail size={18} className="pointer-events-none absolute left-3.5 text-white/50" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@hotel.com"
              className="w-full rounded-md border border-white/18 bg-white/8 py-3.5 pl-11 pr-3.5 text-sm text-white placeholder:text-white/40 focus:border-terracota-500 focus:bg-white/12 focus:shadow-[0_0_0_4px_rgba(212,122,90,0.15)] focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-white/85" htmlFor="password">
            Contraseña
          </label>
          <div className="relative flex items-center">
            <Lock size={18} className="pointer-events-none absolute left-3.5 text-white/50" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-white/18 bg-white/8 py-3.5 pl-11 pr-11 text-sm text-white placeholder:text-white/40 focus:border-terracota-500 focus:bg-white/12 focus:shadow-[0_0_0_4px_rgba(212,122,90,0.15)] focus:outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-white/50"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <label className="inline-flex items-center gap-1.5 text-xs text-white/70">
              <input
                type="checkbox"
                defaultChecked
                className="accent-terracota-500"
              />
              Recordar este dispositivo
            </label>
            <a href="#" className="text-xs font-semibold text-terracota-500">
              ¿Olvidaste tu clave?
            </a>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-[52px] w-full items-center justify-center rounded-full bg-terracota-500 text-base font-semibold text-white transition-colors hover:bg-terracota-600 disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar al panel"}
        </button>

        {/* Divider */}
        <div className="my-2 flex items-center gap-3 text-xs text-white/50">
          <span className="h-px flex-1 bg-white/15" />
          o continúa con
          <span className="h-px flex-1 bg-white/15" />
        </div>

        {/* Google */}
        <button
          type="button"
          className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 font-semibold text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.3-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.2z" />
            <path d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.6C4.4 19.6 7.9 22 12 22z" opacity="0.6" />
            <path d="M6.2 13.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V7.7H2.7C2 9 1.7 10.4 1.7 12s.3 3 1 4.3l3.5-2.6z" opacity="0.6" />
            <path d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3C17.1 2.6 14.7 1.7 12 1.7 7.9 1.7 4.4 4.1 2.7 7.5l3.5 2.7c.8-2.5 3.1-4.4 5.8-4.4z" />
          </svg>
          Google Workspace
        </button>
      </form>

      {/* Footer */}
      <p className="mt-auto text-center text-xs text-white/60">
        ¿Aún no tienes cuenta?{" "}
        <a href="#" className="font-semibold text-terracota-500">
          Habla con ventas →
        </a>
      </p>
    </div>
  );
}
