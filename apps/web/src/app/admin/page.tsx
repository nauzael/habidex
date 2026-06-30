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
  TrendingDown,
} from "lucide-react";

/* ─── Types ─── */

interface AdminStats {
  totalHotels: number;
  activeHotels: number;
  totalUsers: number;
  totalBookings: number;
  revenueMonth: number;
  occupancyAvg: number;
  growthPercent: number;
  growthData?: { month: string; hotels: number }[];
}

interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  database: "ok" | "error";
  redis: "ok" | "error";
  kafka: "ok" | "error";
  uptime: number;
  version: string;
}

/* ─── Helpers ─── */

function formatCOP(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("es-CO");
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
          sub={`${stats?.activeHotels ?? 0} activos`}
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
          value={stats?.occupancyAvg ? `${stats.occupancyAvg}%` : "—"}
          sub="general"
          color="text-sage-600"
          bgColor="bg-sage-100"
        />
        <KpiCard
          icon={TrendingUp}
          label="Ingresos del mes"
          value={stats?.revenueMonth ? formatCOP(stats.revenueMonth) : "—"}
          sub={stats?.growthPercent ? `${stats.growthPercent > 0 ? "+" : ""}${stats.growthPercent}% vs mes ant.` : ""}
          color="text-slate-900"
          bgColor="bg-slate-100"
          trend={stats?.growthPercent}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Growth chart */}
        <GrowthChart data={stats?.growthData} />

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
  trend,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  sub: string;
  color: string;
  bgColor: string;
  trend?: number;
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
        {trend !== undefined && trend !== 0 && (
          <span className={trend > 0 ? "text-sage-600" : "text-red-500"}>
            {trend > 0 ? <TrendingUp size={14} className="inline" /> : <TrendingDown size={14} className="inline" />}
          </span>
        )}
        {sub}
      </div>
    </div>
  );
}

function GrowthChart({ data }: { data?: { month: string; hotels: number }[] }) {
  const maxVal = data ? Math.max(...data.map((d) => d.hotels), 1) : 1;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        CRECIMIENTO
      </div>
      <h3 className="mb-5 font-display text-lg font-bold tracking-tight text-text">
        Hoteles registrados
      </h3>

      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp size={32} className="mb-2 text-soft" />
          <p className="font-semibold text-text">Sin datos de crecimiento</p>
          <p className="text-xs text-muted">No hay datos históricos disponibles</p>
        </div>
      ) : (
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {data.map((point, i) => {
            const h = `${Math.max((point.hotels / maxVal) * 100, 4)}%`;
            return (
              <div key={point.month} className="flex flex-1 flex-col items-center justify-end">
                <span className="mb-1 text-[10px] font-medium text-muted tabular-nums">
                  {point.hotels}
                </span>
                <div
                  className="w-full max-w-[40px] rounded-t-sm bg-slate-900 transition-colors hover:bg-slate-700"
                  style={{ height: h }}
                />
                <span className="mt-1.5 text-[10px] text-muted">{point.month}</span>
              </div>
            );
          })}
        </div>
      )}
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
  const statusColor =
    health?.status === "healthy"
      ? "text-sage-600"
      : health?.status === "degraded"
        ? "text-amber-500"
        : "text-red-500";

  const statusBg =
    health?.status === "healthy"
      ? "bg-sage-100"
      : health?.status === "degraded"
        ? "bg-amber-100"
        : "bg-red-100";

  const statusLabel =
    health?.status === "healthy"
      ? "Saludable"
      : health?.status === "degraded"
        ? "Degradado"
        : "Caído";

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
          {/* Status badge */}
          <div className="mb-5 flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusBg} ${statusColor}`}
            >
              {health.status === "healthy" ? (
                <CheckCircle2 size={14} />
              ) : (
                <XCircle size={14} />
              )}
              {statusLabel}
            </span>
            <span className="text-xs text-muted">v{health.version}</span>
          </div>

          {/* Service rows */}
          <div className="space-y-3">
            <ServiceRow name="Base de datos" ok={health.database === "ok"} />
            <ServiceRow name="Redis" ok={health.redis === "ok"} />
            <ServiceRow name="Kafka" ok={health.kafka === "ok"} />
          </div>

          {/* Uptime */}
          <div className="mt-4 border-t border-border pt-3 text-xs text-muted">
            Uptime:{" "}
            {health.uptime > 86400
              ? `${Math.floor(health.uptime / 86400)}d ${Math.floor((health.uptime % 86400) / 3600)}h`
              : health.uptime > 3600
                ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m`
                : `${Math.floor(health.uptime / 60)}m`}
          </div>
        </>
      )}
    </div>
  );
}

function ServiceRow({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-4 py-3">
      <span className="text-sm font-medium text-text">{name}</span>
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
  );
}
