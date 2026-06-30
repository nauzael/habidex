"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  ClipboardList,
  Settings,
  Users,
  Home,
  LogOut,
  Sparkles,
} from "lucide-react";
import { logout } from "@/lib/auth";

const mainNav = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/reservas", label: "Reservas", icon: Calendar, count: 12 },
  { href: "/calendario", label: "Calendario", icon: Home },
  { href: "#", label: "Huéspedes", icon: Users },
  { href: "#", label: "Reportes", icon: ClipboardList },
];

const secondaryNav = [
  { href: "#", label: "Personal", icon: Users },
  { href: "/perfil", label: "Mi Perfil", icon: Sparkles },
];

const bottomNav = [
  { href: "/perfil", label: "Configuración", icon: Settings },
  { href: "/login", label: "Cerrar sesión", icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({
    href,
    label,
    icon: Icon,
    count,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    count?: number;
  }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-white/10 font-semibold text-white before:absolute before:left-[-20px] before:top-2 before:h-8 before:w-[3px] before:rounded-r-md before:bg-terracota-500"
            : "text-white/78 hover:bg-white/6 hover:text-white"
        } relative`}
      >
        <span className="grid h-5 w-5 flex-shrink-0 place-items-center">
          <Icon size={18} />
        </span>
        {label}
        {count !== undefined && (
          <span className="ml-auto rounded-full bg-terracota-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-7 bg-gradient-to-b from-slate-900 to-slate-800 px-5 py-6 text-white">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-3 px-0.5">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-terracota-500 font-display text-lg font-extrabold text-white">
          H
        </span>
        <span className="font-display text-xl font-bold tracking-tight">Habidex</span>
      </Link>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {mainNav.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Secondary nav */}
      <div>
        <span className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
          Gestión
        </span>
        <nav className="flex flex-col gap-1">
          {secondaryNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>
      </div>

      {/* Spacer + bottom nav */}
      <div className="mt-auto">
        <nav className="flex flex-col gap-1">
          {bottomNav.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        {/* CTA */}
        <div className="relative mt-6 overflow-hidden rounded-lg border border-white/10 bg-white/4 p-5">
          <div className="pointer-events-none absolute -right-4 -top-16 h-40 w-40 bg-[radial-gradient(circle,rgba(212,122,90,0.35),transparent_70%)]" />
          <div className="relative z-10">
            <div className="font-display text-base font-bold">Plan Free</div>
            <div className="mb-3 text-xs text-white/60">
              Desbloquea Revenue Forecast, integraciones con Booking y reportes avanzados.
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/16"
            >
              Mejorar plan
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
