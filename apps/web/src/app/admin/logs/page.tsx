"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import {
  ScrollText,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronDown,
  Filter,
  Info,
  AlertCircle,
  XCircle,
  Bug,
} from "lucide-react";

/* ─── Types ─── */

interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  module: string;
  message: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

type LogLevel = "all" | "info" | "warn" | "error" | "debug";

/* ─── Helpers ─── */

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLevelBadge(level: string): { label: string; className: string; icon: React.ComponentType<{ size?: number }> } {
  switch (level) {
    case "info":
      return { label: "INFO", className: "bg-slate-100 text-slate-700", icon: Info };
    case "warn":
      return { label: "WARN", className: "bg-amber-100 text-amber-600", icon: AlertCircle };
    case "error":
      return { label: "ERROR", className: "bg-red-100 text-red-600", icon: XCircle };
    case "debug":
      return { label: "DEBUG", className: "bg-sage-100 text-sage-600", icon: Bug };
    default:
      return { label: level.toUpperCase(), className: "bg-slate-100 text-slate-700", icon: Info };
  }
}

const LEVELS: { key: LogLevel; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "error", label: "Error" },
  { key: "warn", label: "Warn" },
  { key: "info", label: "Info" },
  { key: "debug", label: "Debug" },
];

/* ─── Skeleton ─── */

function LogsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-16 rounded-lg border border-border bg-card" />
      ))}
    </div>
  );
}

/* ─── Page ─── */

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<LogLevel>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (levelFilter !== "all") params.level = levelFilter;
      if (moduleFilter) params.module = moduleFilter;
      const res = await api.get<{ data: LogEntry[] }>("/admin/logs", { params });
      setLogs(res.data.data || []);
    } catch {
      setError("Error al cargar logs");
    } finally {
      setLoading(false);
    }
  }, [levelFilter, moduleFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Unique modules for filter
  const modules = [...new Set(logs.map((l) => l.module))].sort();

  // Client-side search filter on top of server filters
  const filtered = searchQuery
    ? logs.filter(
        (l) =>
          l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.module.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-text">
            Logs del Sistema
          </h1>
          <p className="mt-1 text-sm text-muted">
            Registro de eventos y errores de la plataforma
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
            showFilters || levelFilter !== "all" || moduleFilter
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-border bg-card text-text hover:bg-surface-2"
          }`}
        >
          <Filter size={14} />
          Filtros
          {(levelFilter !== "all" || moduleFilter) && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px]">
              Activos
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-5 rounded-lg border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-end gap-5">
            {/* Level filter */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Nivel
              </label>
              <div className="flex gap-1.5">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.key}
                    onClick={() => setLevelFilter(lvl.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      levelFilter === lvl.key
                        ? "bg-slate-900 text-white"
                        : "border border-border bg-surface-2 text-muted hover:bg-border"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Module filter */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Módulo
              </label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-text focus:border-slate-900 focus:outline-none"
              >
                <option value="">Todos los módulos</option>
                {modules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Date - simple version with just refresh */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                &nbsp;
              </label>
              <button
                onClick={fetchLogs}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-text hover:bg-surface-2"
              >
                <RefreshCw size={14} />
                Refrescar
              </button>
            </div>
          </div>
        </div>
      )}

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
          placeholder="Buscar en logs…"
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 pl-10 text-sm text-text placeholder:text-soft focus:border-slate-900 focus:outline-none"
        />
      </div>

      {/* Loading */}
      {loading && <LogsSkeleton />}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle size={36} className="mb-3 text-red-500" />
          <p className="mb-2 font-semibold text-text">{error}</p>
          <button
            onClick={fetchLogs}
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
          <ScrollText size={36} className="mb-3 text-soft" />
          <p className="font-semibold text-text">
            {searchQuery || levelFilter !== "all" || moduleFilter
              ? "Sin resultados"
              : "Sin logs"}
          </p>
          <p className="text-sm text-muted">
            {searchQuery || levelFilter !== "all" || moduleFilter
              ? "No se encontraron logs con los filtros aplicados"
              : "No hay logs registrados en el sistema"}
          </p>
        </div>
      )}

      {/* Log entries */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((log) => {
            const badge = getLevelBadge(log.level);
            const BadgeIcon = badge.icon;
            const isExpanded = expandedId === log.id;

            return (
              <div
                key={log.id}
                className="rounded-lg border border-border bg-card shadow-xs transition-shadow hover:shadow-sm"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="flex w-full items-center gap-4 px-5 py-3.5 text-left"
                >
                  <span
                    className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${badge.className}`}
                  >
                    <BadgeIcon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs font-medium text-muted">
                        {log.module}
                      </span>
                    </div>
                    <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-text">
                      {log.message}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-muted sm:inline">
                      {formatDateTime(log.createdAt)}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-soft transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded metadata */}
                {isExpanded && log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="border-t border-border px-5 pb-4 pt-3">
                    <pre className="overflow-x-auto rounded-md bg-slate-900 p-4 text-xs text-white/80">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                {isExpanded && (!log.metadata || Object.keys(log.metadata).length === 0) && (
                  <div className="border-t border-border px-5 pb-4 pt-3 text-xs text-muted">
                    Sin metadatos adicionales
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
