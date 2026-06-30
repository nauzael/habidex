"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Building2,
  Search,
  Users,
  CalendarCheck,
  MoreHorizontal,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Crown,
  Zap,
  Star,
} from "lucide-react";

/* ─── Types ─── */

interface AdminHotel {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  timezone: string;
  currency: string;
  plan: string;
  active: boolean;
  userCount: number;
  bookingCount: number;
  createdAt: string;
}

/* ─── Helpers ─── */

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPlanBadge(plan: string): { label: string; className: string; icon: React.ComponentType<{ size?: number }> } {
  switch (plan?.toLowerCase()) {
    case "founders":
    case "founder":
      return {
        label: "Founders",
        className: "bg-amber-100 text-amber-600",
        icon: Crown,
      };
    case "micro":
      return {
        label: "Micro",
        className: "bg-slate-100 text-slate-700",
        icon: Star,
      };
    case "growth":
      return {
        label: "Growth",
        className: "bg-sage-100 text-sage-600",
        icon: Zap,
      };
    case "enterprise":
      return {
        label: "Enterprise",
        className: "bg-slate-900 text-white",
        icon: Crown,
      };
    default:
      return {
        label: plan || "Free",
        className: "bg-slate-100 text-slate-700",
        icon: Star,
      };
  }
}

/* ─── Skeleton ─── */

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-lg border border-border bg-card" />
      ))}
    </div>
  );
}

/* ─── Page ─── */

export default function AdminHotelesPage() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: AdminHotel[] }>("/admin/hotels");
      setHotels(res.data.data || []);
    } catch {
      setError("Error al cargar hoteles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const filtered = hotels.filter((h) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.phone?.toLowerCase().includes(q) ||
      h.plan?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text">
            Hoteles
          </h1>
          <p className="mt-1 text-sm text-muted">
            {hotels.length} {hotels.length === 1 ? "hotel registrado" : "hoteles registrados"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-soft"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar hotel…"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 pl-10 text-sm text-text placeholder:text-soft focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* Loading */}
      {loading && <TableSkeleton />}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={36} className="mb-3 text-red-500" />
          <p className="mb-2 font-semibold text-text">{error}</p>
          <button
            onClick={fetchHotels}
            className="inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 size={36} className="mb-3 text-soft" />
          <p className="font-semibold text-text">
            {searchQuery ? "Sin resultados" : "Sin hoteles registrados"}
          </p>
          <p className="text-sm text-muted">
            {searchQuery
              ? "No se encontraron hoteles con ese filtro"
              : "No hay hoteles registrados en la plataforma"}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Hotel</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3 hidden sm:table-cell">Contacto</th>
                <th className="px-5 py-3 hidden md:table-cell">Usuarios</th>
                <th className="px-5 py-3 hidden md:table-cell">Reservas</th>
                <th className="px-5 py-3 hidden lg:table-cell">Registro</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((hotel) => {
                const badge = getPlanBadge(hotel.plan);
                const BadgeIcon = badge.icon;
                return (
                  <tr
                    key={hotel.id}
                    className="transition-colors hover:bg-surface-2"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-xs font-bold text-white">
                          {hotel.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text">
                              {hotel.name}
                            </span>
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${
                                hotel.active ? "bg-sage-500" : "bg-red-500"
                              }`}
                            />
                          </div>
                          <div className="text-xs text-muted">
                            {hotel.timezone} · {hotel.currency}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                      >
                        <BadgeIcon size={12} />
                        {badge.label}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      <div className="text-sm text-text">{hotel.email || "—"}</div>
                      <div className="text-xs text-muted">{hotel.phone || "—"}</div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-text">
                        <Users size={14} className="text-muted" />
                        {hotel.userCount}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm text-text">
                        <CalendarCheck size={14} className="text-muted" />
                        {hotel.bookingCount}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <span className="text-sm text-muted">
                        {formatDate(hotel.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/hoteles/${hotel.id}`}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-text"
                      >
                        Ver <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
