"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getUser } from "@/lib/auth";

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/hoteles": "Hoteles",
  "/admin/logs": "Logs",
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const user = getUser();

  // Build breadcrumbs from path segments
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { href: string; label: string }[] = [];
  let accum = "";
  for (const seg of segments) {
    accum += "/" + seg;
    // Use mapped label or humanize
    if (breadcrumbMap[accum]) {
      breadcrumbs.push({ href: accum, label: breadcrumbMap[accum] });
    } else {
      breadcrumbs.push({
        href: accum,
        label: seg
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      });
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-soft" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-text">{crumb.label}</span>
            ) : (
              <span className="text-muted">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* User info */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="hidden sm:inline">{user?.name || "Admin"}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-terracota-500 to-terracota-600 text-xs font-bold text-white">
          {user?.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "A"}
        </span>
      </div>
    </header>
  );
}
