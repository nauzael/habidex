"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import LayoutWrapper from "@/components/LayoutWrapper";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Users,
  QrCode,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  BarChart3,
  CalendarCheck,
} from "lucide-react";

/* ─── Types ─── */

interface HotelProfile {
  hotel: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    timezone: string;
    currency: string;
    isFounder: boolean;
    features: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    users: number;
    recentBookings: number;
  };
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  }[];
}

interface WhatsAppStatus {
  connected: boolean;
  phone?: string;
  sessionId: string;
}

interface ChannelStatus {
  booking: { connected: boolean; configured: boolean };
  despegar: { connected: boolean; configured: boolean };
}

interface HotelStats {
  totalBookings: number;
  totalRevenue: number;
  roomTypes: number;
  inventoryDays: number;
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

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-semibold text-sage-600">
      <CheckCircle2 size={12} />
      Conectado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-500">
      <XCircle size={12} />
      Desconectado
    </span>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border ${className}`}
    />
  );
}

/* ─── Profile Skeleton ─── */

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[800px] space-y-6 px-5 pb-9 pt-3 md:px-0 md:pt-0">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <SkeletonBlock className="h-48 rounded-lg" />
    </div>
  );
}

/* ─── Profile Page ─── */

export default function PerfilPage() {
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [whatsapp, setWhatsapp] = useState<WhatsAppStatus | null>(null);
  const [channels, setChannels] = useState<ChannelStatus | null>(null);
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whatsappConnecting, setWhatsappConnecting] = useState(false);
  const user = getUser();

  const loadData = useCallback(async () => {
    try {
      const [profileRes, whatsappRes, channelsRes, statsRes] =
        await Promise.allSettled([
          api.get<HotelProfile>("/hotels/profile"),
          api.get<WhatsAppStatus>("/whatsapp/status"),
          api.get<ChannelStatus>("/channels/status"),
          api.get<HotelStats>("/hotels/stats", {
            params: {
              from: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
              to: new Date().toISOString().split("T")[0],
            },
          }),
        ]);

    if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
    if (whatsappRes.status === "fulfilled") setWhatsapp(whatsappRes.value.data);
    if (channelsRes.status === "fulfilled") setChannels(channelsRes.value.data);
    if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
    } catch {
      setError("Error al cargar datos del perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConnectWhatsapp = async () => {
    setWhatsappConnecting(true);
    try {
      const res = await api.post("/whatsapp/session");
      if (res.data?.sessionId) {
        const qrRes = await api.get("/whatsapp/qr");
        setQrImage(qrRes.data.qrCode);
        // Refresh status after a moment
        setTimeout(async () => {
          const statusRes = await api.get("/whatsapp/status");
          setWhatsapp(statusRes.data);
          setWhatsappConnecting(false);
        }, 5000);
      }
    } catch {
      setWhatsappConnecting(false);
      setError("Error al conectar WhatsApp");
    }
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <ProfileSkeleton />
      </LayoutWrapper>
    );
  }

  if (error && !profile) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <XCircle size={40} className="mb-4 text-red-500" />
          <p className="mb-2 font-semibold text-text">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-terracota-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracota-600"
          >
            Reintentar
          </button>
        </div>
      </LayoutWrapper>
    );
  }

  const hotel = profile?.hotel;

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-[800px] space-y-6 px-5 pb-9 pt-3 md:px-0 md:pt-0">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-text md:text-[36px]">
              Mi Perfil
            </h1>
            <p className="mt-1 text-sm text-muted">
              Configuración de tu hotel y conexiones
            </p>
          </div>
          {hotel?.isFounder && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-500">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              PLAN FOUNDERS
            </span>
          )}
        </div>

        {/* Hotel Info Card */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            INFORMACIÓN DEL HOTEL
          </div>
          <h2 className="mb-5 font-display text-xl font-bold tracking-tight text-text">
            {hotel?.name || "Mi Hotel"}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoRow icon={Building2} label="Nombre" value={hotel?.name} />
            <InfoRow icon={Mail} label="Email" value={hotel?.email || "—"} />
            <InfoRow icon={Phone} label="Teléfono" value={hotel?.phone || "—"} />
            <InfoRow icon={MapPin} label="Dirección" value={hotel?.address || "—"} />
            <InfoRow icon={Globe} label="Zona horaria" value={hotel?.timezone} />
            <InfoRow icon={DollarSign} label="Moneda" value={hotel?.currency} />
          </div>
          <div className="mt-5 border-t border-border pt-4 text-xs text-soft">
            Registrado el {hotel?.createdAt ? formatDate(hotel.createdAt) : "—"}
          </div>
        </section>

        {/* Statistics */}
        {stats && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={CalendarCheck}
              label="Reservas (30d)"
              value={stats.totalBookings.toString()}
              color="text-slate-900"
            />
            <StatCard
              icon={BarChart3}
              label="Ingresos (30d)"
              value={formatCOP(stats.totalRevenue)}
              color="text-sage-600"
            />
            <StatCard
              icon={Building2}
              label="Tipos de habitación"
              value={stats.roomTypes.toString()}
              color="text-terracota-500"
            />
            <StatCard
              icon={Users}
              label="Usuarios"
              value={profile?.stats.users.toString() || "0"}
              color="text-slate-500"
            />
          </section>
        )}

        {/* WhatsApp Connection */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            WHATSAPP
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-text">
                Conexión WhatsApp
              </h3>
              <p className="mt-1 text-sm text-muted">
                Conecta WhatsApp para recibir notificaciones de reservas y alertas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge connected={whatsapp?.connected ?? false} />
            </div>
          </div>

          {!whatsapp?.connected ? (
            <div className="mt-5">
              {qrImage ? (
                <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-surface-2 p-6">
                  <p className="text-sm font-medium text-text">
                    Escanea este código QR con WhatsApp en tu celular
                  </p>
                  <img
                    src={qrImage}
                    alt="WhatsApp QR Code"
                    className="h-48 w-48 rounded-md border border-border"
                  />
                  <p className="text-xs text-muted">
                    Abre WhatsApp → Menú → WhatsApp Web → Escanea
                  </p>
                  <button
                    onClick={() => setQrImage(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2"
                  >
                    <RefreshCw size={14} />
                    Generar nuevo QR
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWhatsapp}
                  disabled={whatsappConnecting}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-sage-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage-600 disabled:opacity-50"
                >
                  {whatsappConnecting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Conectando…
                    </>
                  ) : (
                    <>
                      <QrCode size={16} />
                      Conectar WhatsApp
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-3 rounded-md border border-sage-100 bg-sage-100/30 p-4">
              <CheckCircle2 size={20} className="text-sage-500" />
              <div>
                <p className="text-sm font-semibold text-text">
                  WhatsApp conectado
                </p>
                {whatsapp?.phone && (
                  <p className="text-xs text-muted">{whatsapp.phone}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* OTA Channels */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            CANALES OTA
          </div>
          <h3 className="font-display text-lg font-bold tracking-tight text-text">
            Conexión con OTAs
          </h3>
          <p className="mt-1 text-sm text-muted">
            Estado de la integración con plataformas de reserva
          </p>

          <div className="mt-5 space-y-4">
            {/* Booking.com */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 font-display text-sm font-bold text-slate-700">
                  B
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">Booking.com</div>
                  <div className="text-xs text-muted">
                    {channels?.booking.configured
                      ? "API configurada"
                      : "API no configurada"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {channels?.booking.configured ? (
                  <StatusBadge connected={channels.booking.connected} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-500">
                    <Clock size={12} />
                    Pendiente
                  </span>
                )}
              </div>
            </div>

            {/* Despegar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-100 font-display text-sm font-bold text-sage-600">
                  D
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">Despegar</div>
                  <div className="text-xs text-muted">
                    {channels?.despegar.configured
                      ? "API configurada"
                      : "API no configurada"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {channels?.despegar.configured ? (
                  <StatusBadge connected={channels.despegar.connected} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-500">
                    <Clock size={12} />
                    Pendiente
                  </span>
                )}
              </div>
            </div>

            {/* CSV Export */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-terracota-100 font-display text-sm font-bold text-terracota-500">
                  CSV
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">
                    Exportar / Importar CSV
                  </div>
                  <div className="text-xs text-muted">
                    Descarga el inventario para carga manual en OTAs
                  </div>
                </div>
              </div>
              <a
                href={`${api.defaults.baseURL}/channels/export-csv?from=${new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]}&to=${new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2"
              >
                <Download size={14} />
                Exportar CSV
              </a>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            EQUIPO
          </div>
          <h3 className="font-display text-lg font-bold tracking-tight text-text">
            Usuarios del hotel
          </h3>

          <div className="mt-5 space-y-3">
            {profile?.users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-2 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-xs font-bold text-white">
                    {u.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    {u.role === "OWNER" ? "Dueño" : u.role === "ADMIN" ? "Admin" : "Staff"}
                  </span>
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      u.active ? "bg-sage-500" : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </LayoutWrapper>
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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-full border border-border bg-surface-2 ${color}`}>
          <Icon size={14} />
        </span>
      </div>
      <div className={`font-display text-2xl font-bold tracking-tight tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}
