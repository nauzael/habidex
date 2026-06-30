"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ScrollText, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hoteles", label: "Hoteles", icon: Building2 },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col items-center gap-6 bg-slate-900 px-3 py-6">
      {/* Logo */}
      <Link
        href="/admin"
        className="grid h-10 w-10 place-items-center rounded-[10px] bg-terracota-500 font-display text-lg font-extrabold text-white"
      >
        H
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`grid h-11 w-11 place-items-center rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/12 text-white"
                  : "text-white/55 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </nav>

      {/* Spacer + back */}
      <div className="mt-auto">
        <Link
          href="/dashboard"
          title="Volver al panel"
          className="grid h-11 w-11 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>
    </aside>
  );
}
