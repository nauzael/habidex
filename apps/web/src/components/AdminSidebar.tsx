"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ScrollText,
  Settings,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { logout } from "@/lib/auth";

const mainNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hoteles", label: "Hoteles", icon: Building2, count: true },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

const bottomItems = [
  { href: "/dashboard", label: "Volver a la app", icon: ArrowLeft },
  { href: "/login", label: "Cerrar sesión", icon: LogOut, danger: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-7 bg-gradient-to-b from-slate-900 to-slate-800 px-5 py-6 text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-0.5">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-terracota-500 font-display text-lg font-extrabold text-white">
          H
        </span>
        <div className="flex flex-col">
          <span className="font-display text-xl font-bold tracking-tight">Habidex</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-amber-500">
            <Shield size={12} />
            Admin
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {mainNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 font-semibold text-white before:absolute before:left-[-20px] before:top-2 before:h-8 before:w-[3px] before:rounded-r-md before:bg-terracota-500"
                  : "text-white/78 hover:bg-white/6 hover:text-white"
              }`}
            >
              <span className="grid h-5 w-5 flex-shrink-0 place-items-center">
                <item.icon size={18} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Spacer + bottom */}
      <div className="mt-auto">
        <nav className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.label === "Cerrar sesión" ? (e) => { e.preventDefault(); logout(); } : undefined}
              className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors hover:bg-white/6 hover:text-white ${
                item.danger ? "text-red-400 hover:text-red-300" : "text-white/55"
              }`}
            >
              <span className="grid h-5 w-5 flex-shrink-0 place-items-center">
                <item.icon size={18} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="relative mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/4 p-5">
          <div className="pointer-events-none absolute -right-4 -top-16 h-40 w-40 bg-[radial-gradient(circle,rgba(212,122,90,0.35),transparent_70%)]" />
          <div className="relative z-10">
            <div className="font-display text-base font-bold">👑 Admin</div>
            <div className="mb-3 text-xs text-white/60">
              Gestiona hoteles, usuarios y configuración del sistema.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
