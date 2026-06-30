"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import {
  CalendarCheck, LogOut, Home, BarChart3, ArrowUpRight, ArrowDownRight,
  DollarSign, CheckCircle, Wrench, Bell, Zap,
} from "lucide-react";
import Link from "next/link";

interface WeeklyDay {
  date: string;
  day: string;
  occupancy: number;
  revenue: number;
}

interface DashboardSummary {
  occupancyToday: number;
  occupancyPercent: number;
  totalRooms?: number;
  adr: number;
  revpar: number;
  bookingsToday: number;
  checkIns: number;
  checkOuts?: number;
  revenueToday?: number;
  weeklyOccupancy?: WeeklyDay[];
}

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
}

function getStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "confirmed": return { label: "OK", className: "bg-slate-100 text-slate-700" };
    case "pending": return { label: "Pte", className: "bg-amber-100 text-amber-500" };
    case "checked_in": return { label: "Check-in", className: "bg-sage-100 text-sage-600" };
    case "checked_out": return { label: "Salida", className: "bg-slate-100 text-slate-700" };
    case "cancelled": return { label: "Cancelada", className: "bg-red-100 text-red-500" };
    default: return { label: status, className: "bg-slate-100 text-slate-700" };
  }
}

function formatCOP(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("es-CO");
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getOccupancyColor(pct: number): string {
  if (pct > 70) return "text-sage-500";
  if (pct > 30) return "text-amber-500";
  return "text-red-500";
}

/* ===== SKELETON LOADER ===== */
function DashboardSkeleton() {
  return (
    <div className="px-5 pb-9 pt-3">
      {/* Greeting */}
      <div className="mb-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-border" />
          <div className="h-7 w-48 animate-pulse rounded bg-border" />
        </div>
        <div className="h-11 w-11 animate-pulse rounded-full bg-border" />
      </div>
      {/* Hero */}
      <div className="mb-5 h-[200px] animate-pulse rounded-lg bg-gradient-to-br from-slate-800 to-slate-700 p-5" />
      {/* Action tiles */}
      <div className="mb-5 grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-[72px] animate-pulse rounded-md bg-border" />)}
      </div>
      {/* KPI grid */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse rounded-md border border-border bg-card p-4">
            <div className="mb-3 h-3 w-16 rounded bg-border" />
            <div className="h-6 w-24 rounded bg-border" />
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="h-[160px] animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}

/* ===== MOBILE DASHBOARD ===== */
export function DashboardMobile() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getUser();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [summaryRes, bookingsRes] = await Promise.allSettled([
          api.get<DashboardSummary>("/dashboard/summary"),
          api.get<{ data: Booking[] }>("/bookings"),
        ]);
        if (cancelled) return;
        if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.data);
        if (bookingsRes.status === "fulfilled") {
          const data = bookingsRes.value.data;
          setBookings((data.data || []).slice(0, 5));
        }
      } catch {
        if (!cancelled) setError("Error al cargar datos del panel");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="px-5 pb-9 pt-3">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={40} className="mb-4 text-red-500" />
          <p className="mb-2 font-semibold text-text">Error de conexión</p>
          <p className="mb-4 text-sm text-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const dayName = today.toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long",
  });
  const pct = summary?.occupancyPercent ?? 0;
  const occColor = getOccupancyColor(pct);
  const userName = user?.name?.split(" ")[0] || "José";

  return (
    <div className="px-5 pb-9 pt-3">
      {/* Greeting */}
      <div className="mb-5 flex items-center justify-between px-0.5">
        <div>
          <div className="mb-0.5 text-xs font-medium capitalize text-muted">
            {dayName}
          </div>
          <div className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-text">
            Buenos días, {userName}
          </div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-terracota-500 to-terracota-600 font-display text-sm font-bold text-white">
          {user?.name ? getInitials(user.name) : "JJ"}
        </div>
      </div>

      {/* Hero card */}
      <div className="relative mb-5 overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-md">
        <div className="pointer-events-none absolute -right-10 -top-10 h-[140px] w-[140px] bg-[radial-gradient(circle,rgba(212,122,90,0.35),transparent_70%)]" />
        <div className="relative z-10">
          <div className="mb-1 text-xs text-white/70">OCUPACIÓN DE HOY</div>
          <div className="relative z-10 mb-3 font-display text-[28px] font-bold leading-[1.1] tracking-tight text-white">
            {summary?.occupancyToday ?? "--"} / {summary?.totalRooms ?? 30}
            <small className="block text-sm font-medium tracking-normal text-white/60">
              <span className={occColor}>{pct}%</span> de habitaciones ocupadas
            </small>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-3 border-t border-white/12 pt-3">
            <div>
              <div className="mb-1 text-[11px] tracking-wide text-white/60">Check-ins</div>
              <div className="font-display text-xl font-bold text-white tabular-nums">
                {summary?.checkIns ?? "--"}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] tracking-wide text-white/60">Salidas</div>
              <div className="font-display text-xl font-bold text-white tabular-nums">
                {summary?.checkOuts ?? "--"}
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] tracking-wide text-white/60">Ingresos</div>
              <div className="font-display text-xl font-bold text-white tabular-nums">
                {summary?.revenueToday ? formatCOP(summary.revenueToday) : "--"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action tiles */}
      <div className="mb-5 grid grid-cols-4 gap-2">
        {[
          { href: "/reservas", icon: CalendarCheck, label: "Reservas" },
          { href: "#", icon: LogOut, label: "Check-in" },
          { href: "/calendario", icon: Home, label: "Habitaciones" },
          { href: "/tarifas", icon: DollarSign, label: "Tarifas" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-1.5 rounded-md border border-border bg-card px-1 py-3 text-center text-[11px] font-semibold tracking-wide text-text"
          >
            <span className="grid h-[38px] w-[38px] place-items-center rounded-[6px] bg-terracota-50 text-terracota-500">
              <action.icon size={20} />
            </span>
            {action.label}
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {[
          { label: "ADR", value: summary?.adr ? formatCOP(summary.adr) : "--", icon: DollarSign },
          { label: "RevPAR", value: summary?.revpar ? formatCOP(summary.revpar) : "--", icon: BarChart3 },
          { label: "Reservas hoy", value: summary?.bookingsToday?.toString() ?? "--", icon: CalendarCheck },
          { label: "Check-ins", value: summary?.checkIns?.toString() ?? "--", icon: LogOut },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-md border border-border bg-card p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{kpi.label}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-muted">
                <kpi.icon size={14} />
              </span>
            </div>
            <div className="font-display text-xl font-bold text-text tabular-nums">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Weekly occupancy chart */}
      {summary?.weeklyOccupancy && summary.weeklyOccupancy.length > 0 && (
        <section className="mb-5">
          <div className="mb-3 px-0.5">
            <h2 className="font-display text-lg font-bold tracking-tight text-text">
              Ocupación 7 días
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
            <div className="flex items-end gap-1.5" style={{ height: 120 }}>
              {summary.weeklyOccupancy.map((day, i) => {
                const barH = `${Math.max(day.occupancy, 4)}%`;
                const isLast = i === summary.weeklyOccupancy!.length - 1;
                const barColor = day.occupancy > 70 ? "bg-sage-500"
                  : day.occupancy > 30 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center justify-end">
                    <span className="mb-0.5 text-[9px] font-medium text-muted tabular-nums">
                      {day.occupancy}%
                    </span>
                    <div
                      className={`w-full max-w-[28px] rounded-t-sm transition-all hover:-translate-y-0.5 ${
                        isLast
                          ? "bg-gradient-to-b from-terracota-500 to-terracota-600 shadow-[0_4px_12px_rgba(212,122,90,0.30)]"
                          : barColor
                      }`}
                      style={{ height: barH }}
                    />
                    <span className="mt-1 text-[9px] text-muted">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Recent bookings */}
      {bookings.length > 0 ? (
        <section>
          <div className="mb-2 flex items-center justify-between px-0.5">
            <h2 className="font-display text-lg font-bold tracking-tight text-text">
              Últimas reservas
            </h2>
            <Link href="/reservas" className="text-xs font-semibold text-muted">
              Ver todas
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="grid grid-cols-[44px_1fr] gap-2 rounded-md border border-border bg-card p-4 shadow-xs"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-xs font-bold text-white">
                    {booking.initials || getInitials(booking.guestName)}
                  </span>
                  <div className="min-w-0">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-text">
                      {booking.guestName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span>{formatTime(booking.checkIn)}</span>
                      <span className="h-1 w-1 rounded-full bg-soft" />
                      <span>Hab. {booking.roomNumber || booking.roomType || "--"}</span>
                    </div>
                  </div>
                  <div className="col-span-2 col-start-2 mt-1 flex items-center justify-between border-t border-border pt-2">
                    <div className="font-display text-base font-bold text-text tabular-nums">
                      {formatCOP(booking.totalAmount)}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck size={36} className="mb-3 text-soft" />
            <p className="font-semibold text-text">Sin reservas recientes</p>
            <p className="text-sm text-muted">No hay reservas para mostrar</p>
          </div>
        )
      )}

      {/* FAB */}
      <button className="fixed bottom-24 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-terracota-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
        <Zap size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ===== DESKTOP DASHBOARD ===== */
export function DashboardDesktop() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [summaryRes, bookingsRes] = await Promise.allSettled([
          api.get<DashboardSummary>("/dashboard/summary"),
          api.get<{ data: Booking[] }>("/bookings"),
        ]);
        if (cancelled) return;
        if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.data);
        if (bookingsRes.status === "fulfilled") {
          setBookings((bookingsRes.value.data.data || []).slice(0, 5));
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const pct = summary?.occupancyPercent ?? 0;

  if (loading) {
    return (
      <div className="animate-pulse space-y-7">
        <div className="h-8 w-64 rounded bg-border" />
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-lg bg-border" />)}
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="h-80 rounded-lg bg-border" />
          <div className="h-80 rounded-lg bg-border" />
        </div>
      </div>
    );
  }

  const userName = user?.name?.split(" ")[0] || "José";

  return (
    <div>
      {/* Page header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-muted">
            {dateStr}
          </span>
          <h1 className="font-display text-[36px] font-bold leading-[1.15] tracking-tight text-text">
            Buenos días, {userName}
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Tienes{" "}
            <strong className="text-text">{summary?.checkIns ?? 0} check-ins</strong> programados
            hoy y una ocupación del <strong className="text-text">{pct}%</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/calendario"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-card px-5 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-2"
          >
            Ver calendario
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <Zap size={16} strokeWidth={2.4} />
            Nueva reserva
          </Link>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Featured KPI */}
        <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-[120px] w-[120px] bg-[radial-gradient(circle,rgba(212,122,90,0.3),transparent_70%)]" />
          <div className="relative z-10">
            <div className="mb-5 flex items-start justify-between gap-3">
              <span className="text-xs font-medium tracking-wide text-white/70">
                Habitaciones ocupadas
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/8 text-white/80">
                <Home size={16} />
              </span>
            </div>
            <div className="mb-3 font-display text-[48px] font-bold leading-[1.05] tracking-tight text-white tabular-nums">
              {summary?.occupancyToday ?? "--"}{" "}
              <span className="text-base font-medium tracking-normal text-white/50">
                / {summary?.totalRooms ?? 30}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-white/85">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-terracota-500 text-white">
                <ArrowUpRight size={12} />
              </span>
              {pct}% de ocupación
            </div>
          </div>
        </div>

        {/* Regular KPIs */}
        {[
          { label: "ADR", value: summary?.adr ? formatCOP(summary.adr) : "--", delta: "" },
          { label: "RevPAR", value: summary?.revpar ? formatCOP(summary.revpar) : "--", delta: "" },
          { label: "Reservas", value: summary?.bookingsToday?.toString() ?? "--", delta: "hoy" },
          { label: "Check-ins", value: summary?.checkIns?.toString() ?? "--", delta: "hoy" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <span className="text-xs font-medium tracking-wide text-muted">{kpi.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface-2 text-muted">
                <BarChart3 size={16} />
              </span>
            </div>
            <div className="mb-3 font-display text-[48px] font-bold leading-[1.05] tracking-tight text-text tabular-nums">
              {kpi.value}
            </div>
            {kpi.delta && (
              <div className="inline-flex items-center gap-1 text-xs font-medium text-sage-600">
                <ArrowUpRight size={12} />
                {kpi.delta}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Occupancy chart */}
        <div className="rounded-lg border border-border bg-card p-7 shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            ÚLTIMOS 7 DÍAS
          </div>
          <div className="font-display text-xl font-bold tracking-tight text-text">
            Ocupación por día
          </div>
          <div className="mt-6">
            <div className="flex items-end gap-2" style={{ height: 160 }}>
              {(summary?.weeklyOccupancy ?? []).length > 0
                ? summary!.weeklyOccupancy!.map((day, i) => {
                    const h = `${Math.max(day.occupancy, 4)}%`;
                    const isLast = i === summary!.weeklyOccupancy!.length - 1;
                    return (
                      <div key={day.date} className="flex flex-1 flex-col items-center justify-end">
                        <div
                          className={`relative w-[70%] max-w-[56px] rounded-t-lg transition-transform hover:-translate-y-0.5 ${
                            isLast
                              ? "bg-gradient-to-b from-terracota-500 to-terracota-600 shadow-[0_6px_18px_rgba(212,122,90,0.30)]"
                              : "bg-slate-700"
                          }`}
                          style={{ height: h }}
                        />
                        <span className="mt-1 text-center text-xs text-muted">{day.day}</span>
                      </div>
                    );
                  })
                : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                    <div key={d} className="flex flex-1 flex-col items-center justify-end">
                      <div className="h-12 w-[70%] max-w-[56px] rounded-t-lg bg-border" />
                      <span className="mt-1 text-center text-xs text-muted">{d}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg border border-border bg-card p-7 shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            RESUMEN
          </div>
          <div className="font-display text-xl font-bold tracking-tight text-text">
            Indicadores clave
          </div>
          <div className="mt-6 space-y-5">
            {[
              { label: "ADR", value: summary?.adr ? formatCOP(summary.adr) : "--" },
              { label: "RevPAR", value: summary?.revpar ? formatCOP(summary.revpar) : "--" },
              { label: "Ocupación", value: `${pct}%` },
              { label: "Check-ins hoy", value: summary?.checkIns?.toString() ?? "--" },
              { label: "Check-outs hoy", value: summary?.checkOuts?.toString() ?? "--" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                <span className="text-sm text-muted">{item.label}</span>
                <span className="font-display text-lg font-bold text-text tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          ÚLTIMAS RESERVAS
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div className="font-display text-xl font-bold tracking-tight text-text">
            Actividad reciente
          </div>
          <Link href="/reservas" className="text-xs font-medium text-muted hover:text-text">
            Ver todas →
          </Link>
        </div>
        {bookings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking.id}
                  className="grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-md border border-border bg-card p-4 shadow-xs"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-xs font-bold text-white">
                    {booking.initials || getInitials(booking.guestName)}
                  </span>
                  <div className="min-w-0">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold text-text">
                      {booking.guestName}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                      <span>{formatTime(booking.checkIn)}</span>
                      <span className="h-1 w-1 rounded-full bg-soft" />
                      <span>Hab. {booking.roomNumber || booking.roomType || "--"}</span>
                      {booking.channel && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-soft" />
                          <span>{booking.channel}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-bold text-text tabular-nums">
                      {formatCOP(booking.totalAmount)}
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarCheck size={32} className="mb-2 text-soft" />
            <p className="font-semibold text-text">Sin reservas recientes</p>
            <p className="text-sm text-muted">No hay reservas para mostrar</p>
          </div>
        )}
      </div>
    </div>
  );
}
