"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  Building2,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
/* ─── Types ─── */

interface AdminStats {
  totalHotels: number;
  totalUsers: number;
  totalBookings: number;
  totalRooms: number;
  avgOccupancy: number;
  activeSubscriptions: number;
  systemUptime: string;
  databaseSize: string;
}

interface HealthStatus {
  server: "ok" | "error";
  database: "ok" | "error";
  uptime: string;
  timestamp: string;
  version: string;
}

/* ─── Skeleton ─── */

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-border" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-lg border border-border bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-72 rounded-lg border border-border bg-card" />
        <div className="h-72 rounded-lg border border-border bg-card" />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, healthRes] = await Promise.allSettled([
        api.get<AdminStats>("/admin/stats"),
        api.get<HealthStatus>("/admin/health"),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (healthRes.status === "fulfilled") setHealth(healthRes.value.data);
      if (statsRes.status === "rejected" && healthRes.status === "rejected") {
        setError("Error al cargar datos del panel admin");
      }
    } catch {
      setError("Error al cargar datos del panel admin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text">
          Panel de Administración
        </h1>
        <p className="mt-1 text-sm text-muted">
          Resumen general de la plataforma
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Building2}
          label="Hoteles"
          value={stats?.totalHotels?.toString() ?? "—"}
          sub="registrados"
          color="text-slate-900"
          bgColor="bg-slate-100"
        />
        <KpiCard
          icon={Users}
          label="Usuarios"
          value={stats?.totalUsers?.toString() ?? "—"}
          sub="en toda la plataforma"
          color="text-terracota-500"
          bgColor="bg-terracota-100"
        />
        <KpiCard
          icon={Activity}
          label="Ocupación promedio"
          value={stats?.avgOccupancy ? `${stats.avgOccupancy}%` : "—"}
          sub={`${stats?.totalRooms ?? 0} habitaciones totales`}
          color="text-sage-600"
          bgColor="bg-sage-100"
        />
        <KpiCard
          icon={TrendingUp}
          label="BD / Suscripciones"
          value={stats?.databaseSize ?? "—"}
          sub={`${stats?.activeSubscriptions ?? 0} activas`}
          color="text-slate-900"
          bgColor="bg-slate-100"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* System info */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
          <h3 className="mb-4 font-display text-base font-bold text-slate-900">Sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm text-muted">Uptime</span>
              <span className="text-sm font-semibold text-slate-900">{stats?.systemUptime ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm text-muted">Reservas totales</span>
              <span className="text-sm font-semibold text-slate-900">{stats?.totalBookings ?? 0}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm text-muted">Tamaño BD</span>
              <span className="text-sm font-semibold text-sage-600">{stats?.databaseSize ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Health status */}
        <HealthCard health={health} onRetry={fetchData} />
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-start justify-between gap-3">
        <span className="text-xs font-medium tracking-wide text-muted">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-full ${bgColor} ${color}`}>
          <Icon size={16} />
        </span>
      </div>
      <div className={`mb-1 font-display text-3xl font-bold leading-tight tracking-tight tabular-nums ${color}`}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {sub}
      </div>
    </div>
  );
}

function HealthCard({
  health,
  onRetry,
}: {
  health: HealthStatus | null;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          SALUD DEL SISTEMA
        </span>
        <button
          onClick={onRetry}
          className="text-xs text-muted hover:text-text"
          title="Refrescar"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {!health ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity size={32} className="mb-2 text-soft" />
          <p className="text-sm text-muted">No se pudo obtener el estado</p>
        </div>
      ) : (
        <>
          {/* Service rows */}
          <div className="space-y-3">
            <ServiceRow name="Servidor" ok={health.server === "ok"} />
            <ServiceRow name="Base de datos" ok={health.database === "connected"} />
            <ServiceRow name="Versión" ok={true} extra={health.version} />
          </div>

          {/* Uptime */}
          <div className="mt-4 border-t border-border pt-3 text-xs text-muted">
            Uptime: {health.uptime}
          </div>
        </>
      )}
    </div>
  );
}

function ServiceRow({ name, ok, extra }: { name: string; ok: boolean; extra?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-4 py-3">
      <span className="text-sm font-medium text-text">{name}</span>
      <div className="flex items-center gap-2">
        {extra && <span className="text-xs text-muted">{extra}</span>}
        {ok ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sage-600">
            <CheckCircle2 size={14} />
            OK
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
            <XCircle size={14} />
            Error
          </span>
        )}
      </div>
    </div>
  );
}
