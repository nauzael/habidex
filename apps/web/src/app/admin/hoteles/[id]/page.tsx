"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Users,
  CalendarCheck,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Crown,
  Zap,
  Star,
} from "lucide-react";

/* ─── Types ─── */

interface HotelDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  plan: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  features: Record<string, any>;
}

interface HotelStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  roomTypes: number;
  occupancyAvg: number;
}

interface HotelUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLogin: string | null;
}

/* ─── Helpers ─── */

function formatCOP(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("es-CO");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getPlanBadge(plan: string): { label: string; className: string } {
  switch (plan?.toLowerCase()) {
    case "founders":
    case "founder":
      return { label: "Founders", className: "bg-amber-100 text-amber-600" };
    case "micro":
      return { label: "Micro", className: "bg-slate-100 text-slate-700" };
    case "growth":
      return { label: "Growth", className: "bg-sage-100 text-sage-600" };
    case "enterprise":
      return { label: "Enterprise", className: "bg-slate-900 text-white" };
    default:
      return { label: plan || "Free", className: "bg-slate-100 text-slate-700" };
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─── Skeleton ─── */

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-48 rounded bg-border" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="h-48 rounded-lg border border-border bg-card" />
        <div className="h-48 rounded-lg border border-border bg-card" />
      </div>
      <div className="h-48 rounded-lg border border-border bg-card" />
    </div>
  );
}

/* ─── Page ─── */

export default function AdminHotelDetailPage() {
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [users, setUsers] = useState<HotelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hotelRes, statsRes, usersRes] = await Promise.allSettled([
        api.get<HotelDetail>(`/admin/hotels/${hotelId}`),
        api.get<HotelStats>(`/admin/hotels/${hotelId}/stats`),
        api.get<{ data: HotelUser[] }>(`/admin/hotels/${hotelId}/users`),
      ]);
      if (hotelRes.status === "fulfilled") setHotel(hotelRes.value.data);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data.data || []);
      }
      if (hotelRes.status === "rejected") {
        setError("Error al cargar datos del hotel");
      }
    } catch {
      setError("Error al cargar datos del hotel");
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async () => {
    if (!hotel) return;
    setToggling(true);
    try {
      const res = await api.patch<HotelDetail>(`/admin/hotels/${hotelId}`, {
        active: !hotel.active,
      });
      setHotel(res.data);
    } catch {
      setError("Error al actualizar el hotel");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error && !hotel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={40} className="mb-4 text-red-500" />
        <p className="mb-2 font-semibold text-text">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  const badge = hotel ? getPlanBadge(hotel.plan) : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-500 font-display text-lg font-bold text-white">
            {hotel ? getInitials(hotel.name) : "—"}
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text">
              {hotel?.name || "Hotel"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {badge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
                >
                  {badge.label}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  hotel?.active ? "text-sage-600" : "text-red-500"
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    hotel?.active ? "bg-sage-500" : "bg-red-500"
                  }`}
                />
                {hotel?.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {hotel && (
          <div className="flex gap-2">
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                hotel.active
                  ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border border-sage-200 bg-sage-50 text-sage-600 hover:bg-sage-100"
              } disabled:opacity-50`}
            >
              {toggling ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : hotel.active ? (
                <XCircle size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {hotel.active ? "Desactivar" : "Activar"}
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Hotel info */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs lg:col-span-2">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            INFORMACIÓN
          </div>
          <h3 className="mb-5 font-display text-lg font-bold tracking-tight text-text">
            Datos del hotel
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={Building2} label="Nombre" value={hotel?.name} />
            <InfoRow icon={Mail} label="Email" value={hotel?.email || "—"} />
            <InfoRow icon={Phone} label="Teléfono" value={hotel?.phone || "—"} />
            <InfoRow icon={MapPin} label="Dirección" value={hotel?.address || "—"} />
            <InfoRow icon={Globe} label="Zona horaria" value={hotel?.timezone} />
            <InfoRow icon={DollarSign} label="Moneda" value={hotel?.currency} />
          </div>
          <div className="mt-5 border-t border-border pt-4 text-xs text-soft">
            Registrado el {hotel?.createdAt ? formatDate(hotel.createdAt) : "—"}
            {hotel?.updatedAt && ` · Actualizado el ${formatDate(hotel.updatedAt)}`}
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            ESTADÍSTICAS
          </div>
          <h3 className="mb-5 font-display text-lg font-bold tracking-tight text-text">
            Resumen
          </h3>
          {!stats ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 size={28} className="mb-2 text-soft" />
              <p className="text-sm text-muted">Sin datos</p>
            </div>
          ) : (
            <div className="space-y-4">
              <StatRow
                icon={Users}
                label="Usuarios"
                value={stats.totalUsers.toString()}
              />
              <StatRow
                icon={CalendarCheck}
                label="Reservas"
                value={stats.totalBookings.toString()}
              />
              <StatRow
                icon={DollarSign}
                label="Ingresos"
                value={formatCOP(stats.totalRevenue)}
              />
              <StatRow
                icon={Building2}
                label="Tipos de habitación"
                value={stats.roomTypes.toString()}
              />
              <StatRow
                icon={BarChart3}
                label="Ocupación"
                value={`${stats.occupancyAvg}%`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Users section */}
      <div className="mt-5 rounded-lg border border-border bg-card p-6 shadow-xs">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          USUARIOS
        </div>
        <h3 className="mb-5 font-display text-lg font-bold tracking-tight text-text">
          Usuarios del hotel ({users.length})
        </h3>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users size={28} className="mb-2 text-soft" />
            <p className="text-sm text-muted">Sin usuarios registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-2 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-xs font-bold text-white">
                    {getInitials(u.name)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {u.role === "OWNER"
                      ? "Dueño"
                      : u.role === "ADMIN"
                        ? "Admin"
                        : "Staff"}
                  </span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      u.active ? "bg-sage-500" : "bg-red-500"
                    }`}
                  />
                  {u.lastLogin && (
                    <span className="hidden text-xs text-muted md:inline">
                      Último acceso: {formatDate(u.lastLogin)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 text-muted">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted">{label}</div>
        <div className="text-sm font-semibold text-text">{value || "—"}</div>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm text-muted">
        <Icon size={14} />
        {label}
      </span>
      <span className="font-display text-base font-bold text-text tabular-nums">
        {value}
      </span>
    </div>
  );
}
