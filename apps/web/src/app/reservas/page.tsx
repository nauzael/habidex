"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import LayoutWrapper from "@/components/LayoutWrapper";
import {
  Search, ChevronDown, ChevronUp, Calendar, Building, User,
} from "lucide-react";
import Link from "next/link";

interface Booking {
  id: number;
  guestName: string;
  initials?: string;
  checkIn: string;
  checkOut: string;
  roomNumber?: string;
  roomType?: string;
  channel: string;
  totalAmount: number;
  status: string;
  guests?: number;
  nights?: number;
  email?: string;
  phone?: string;
}

function getStatusBadge(status: string): { label: string; className: string; dotClass: string } {
  switch (status) {
    case "confirmed":
      return { label: "Confirmada", className: "bg-sage-100 text-sage-700", dotClass: "bg-sage-500" };
    case "pending":
      return { label: "Pendiente", className: "bg-amber-100 text-amber-700", dotClass: "bg-amber-500" };
    case "checked_in":
      return { label: "Check-in", className: "bg-slate-100 text-slate-700", dotClass: "bg-slate-500" };
    case "checked_out":
      return { label: "Check-out", className: "bg-slate-100 text-slate-700", dotClass: "bg-slate-500" };
    case "cancelled":
      return { label: "Cancelada", className: "bg-red-100 text-red-700", dotClass: "bg-red-500" };
    case "no_show":
      return { label: "No show", className: "bg-red-100 text-red-700", dotClass: "bg-red-500" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-700", dotClass: "bg-slate-500" };
  }
}

function getChannelIcon(channel: string) {
  const c = channel?.toLowerCase() || "";
  if (c.includes("booking")) return "B";
  if (c.includes("expedia")) return "E";
  if (c.includes("airbnb")) return "A";
  if (c.includes("direct") || c.includes("directo")) return "D";
  if (c.includes("phone") || c.includes("teléfono")) return "T";
  if (c.includes("whatsapp")) return "W";
  return c.charAt(0).toUpperCase() || "?";
}

function getChannelColor(channel: string): string {
  const c = channel?.toLowerCase() || "";
  if (c.includes("booking")) return "bg-blue-100 text-blue-700";
  if (c.includes("expedia")) return "bg-amber-100 text-amber-700";
  if (c.includes("airbnb")) return "bg-rose-100 text-rose-700";
  if (c.includes("direct") || c.includes("directo")) return "bg-sage-100 text-sage-700";
  if (c.includes("whatsapp")) return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-700";
}

function formatCOP(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("es-CO");
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const from = new Date(checkIn);
  const to = new Date(checkOut);
  const sameMonth = from.getMonth() === to.getMonth();
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (!sameMonth) {
    return `${from.toLocaleDateString("es-CO", opts)} - ${to.toLocaleDateString("es-CO", opts)}`;
  }
  return `${from.toLocaleDateString("es-CO", { day: "numeric" })} - ${to.toLocaleDateString("es-CO", opts)}`;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    "from-slate-700 to-slate-500",
    "from-terracota-500 to-terracota-600",
    "from-sage-500 to-sage-600",
    "from-amber-500 to-amber-600",
    "from-slate-500 to-slate-400",
    "from-terracota-600 to-terracota-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

type FilterKey = "all" | "today" | "pending" | "confirmed" | "checked_in";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "today", label: "Hoy" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "checked_in", label: "Check-in" },
];

export default function ReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBookings() {
      try {
        const res = await api.get<{ data: Booking[] }>("/bookings");
        if (!cancelled) {
          setBookings(res.data.data || []);
        }
      } catch {
        if (!cancelled) setError("Error al cargar reservas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBookings();
    return () => { cancelled = true; };
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const filtered = bookings.filter((b) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.guestName?.toLowerCase().includes(q);
      const matchRoom = b.roomNumber?.toLowerCase().includes(q);
      const matchChannel = b.channel?.toLowerCase().includes(q);
      if (!matchName && !matchRoom && !matchChannel) return false;
    }
    // Status filter
    switch (activeFilter) {
      case "today": {
        const checkInDate = b.checkIn?.split("T")[0];
        return checkInDate === todayStr;
      }
      case "pending":
        return b.status === "pending";
      case "confirmed":
        return b.status === "confirmed";
      case "checked_in":
        return b.status === "checked_in";
      default:
        return true;
    }
  });

  const counts = {
    all: bookings.length,
    today: bookings.filter((b) => b.checkIn?.split("T")[0] === todayStr).length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    checked_in: bookings.filter((b) => b.status === "checked_in").length,
  };

  return (
    <LayoutWrapper>
      <div className="px-5 pb-9 pt-3">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-0.5">
          <div>
            <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-text">
              Reservas
            </h1>
            <p className="text-xs text-muted">
              {counts.today} hoy · {counts.all} total
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-soft" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, habitación o canal…"
            className="w-full rounded-full border border-border bg-card px-4 py-3 pl-10 text-sm text-text placeholder:text-soft focus:border-slate-900 focus:outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeFilter === f.key
                  ? "bg-slate-900 text-white"
                  : "border border-border bg-card text-text hover:bg-surface-2"
              }`}
            >
              {f.label}
              {counts[f.key] > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeFilter === f.key ? "bg-white/20 text-white" : "bg-surface-2 text-muted"
                }`}>
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[88px] rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-border" />
                    <div className="h-3 w-1/3 rounded bg-border" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-semibold text-text">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar size={36} className="mb-3 text-soft" />
            <p className="font-semibold text-text">Sin reservas</p>
            <p className="text-sm text-muted">
              {searchQuery
                ? "No se encontraron reservas con ese filtro"
                : "No hay reservas para mostrar"}
            </p>
          </div>
        )}

        {/* Booking list */}
        {!loading && !error && (
          <div className="flex flex-col gap-3">
            {filtered.map((booking) => {
              const badge = getStatusBadge(booking.status);
              const isExpanded = expandedId === booking.id;
              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);
              const nights = booking.nights ||
                Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={booking.id}
                  className="rounded-lg border border-border bg-card shadow-xs transition-shadow hover:shadow-sm"
                >
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-3 p-4 text-left"
                  >
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${getAvatarColor(booking.guestName)}`}
                    >
                      {booking.initials || getInitials(booking.guestName)}
                    </span>
                    <div className="min-w-0">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-text">
                        {booking.guestName}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        <span>{formatDateRange(booking.checkIn, booking.checkOut)}</span>
                        <span className="h-1 w-1 rounded-full bg-soft" />
                        <span>Hab. {booking.roomNumber || booking.roomType || "--"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="font-display text-base font-bold text-text tabular-nums">
                        {formatCOP(booking.totalAmount)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                          {badge.label}
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="text-soft" /> : <ChevronDown size={14} className="text-soft" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                      <div className="mb-3 grid grid-cols-2 gap-3">
                        <div className="rounded-md bg-surface-2 p-3">
                          <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-medium text-muted">
                            <Calendar size={12} />
                            Check-in
                          </div>
                          <div className="text-sm font-semibold text-text">
                            {checkInDate.toLocaleDateString("es-CO", {
                              weekday: "short", day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-muted">
                            {checkInDate.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="rounded-md bg-surface-2 p-3">
                          <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-medium text-muted">
                            <Calendar size={12} />
                            Check-out
                          </div>
                          <div className="text-sm font-semibold text-text">
                            {checkOutDate.toLocaleDateString("es-CO", {
                              weekday: "short", day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-muted">
                            {nights} {nights === 1 ? "noche" : "noches"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {booking.channel && (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getChannelColor(booking.channel)}`}>
                            <Building size={10} />
                            {booking.channel}
                          </span>
                        )}
                        {booking.guests && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                            <User size={10} />
                            {booking.guests} {booking.guests === 1 ? "huésped" : "huéspedes"}
                          </span>
                        )}
                        {booking.roomType && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                            <Building size={10} />
                            {booking.roomType}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
