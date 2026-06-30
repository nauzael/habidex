"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, DollarSign, ClipboardList, Settings } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/tarifas", label: "Tarifas", icon: DollarSign },
  { href: "/reservas", label: "Reservas", icon: ClipboardList },
  { href: "/perfil", label: "Perfil", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-border bg-card px-1 pb-4 pt-1.5">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-semibold tracking-wider transition-colors ${
              isActive
                ? "text-slate-900 before:absolute before:-top-0.5 before:left-1/2 before:h-0.5 before:w-6 before:-translate-x-1/2 before:rounded-full before:bg-terracota-500"
                : "text-soft"
            }`}
          >
            <span className="grid h-5 w-5 place-items-center">
              <Icon size={20} />
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
