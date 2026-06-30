"use client";

import { Search, MessageCircle, Bell, User } from "lucide-react";
import { getUser } from "@/lib/auth";

export default function Topbar() {
  const user = getUser();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center gap-5 border-b border-border bg-card px-8">
      {/* Search */}
      <div className="relative max-w-[460px] flex-1">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft"
        />
        <input
          type="text"
          placeholder="Buscar reserva, huésped o habitación…"
          className="w-full rounded-full border border-border bg-surface-2 px-4 py-2.5 pl-10 text-sm text-text placeholder:text-soft focus:border-slate-900 focus:bg-card focus:outline-none"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-muted sm:inline-block">
          ⌘ F
        </kbd>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Plan badge */}
        <span className="inline-flex items-center gap-1 rounded-full bg-terracota-100 px-2.5 py-1 text-xs font-semibold text-terracota-600">
          <span className="h-2 w-2 rounded-full bg-terracota-500" />
          FREE
        </span>

        {/* Messages */}
        <button
          aria-label="Mensajes"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-text transition-colors hover:bg-surface-2"
        >
          <MessageCircle size={18} />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notificaciones"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-text transition-colors hover:bg-surface-2"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-card bg-terracota-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 rounded-full border border-border bg-card py-1 pl-1 pr-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-terracota-500 to-terracota-600 text-sm font-bold text-white">
            {user?.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "U"}
          </span>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-text">
              {user?.name || "Usuario"}
            </div>
            <div className="text-[11px] text-muted">
              {user?.email || "Hotel Habidex"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
