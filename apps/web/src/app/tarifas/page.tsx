"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import LayoutWrapper from "@/components/LayoutWrapper";
import {
  ChevronLeft, ChevronRight, X, Percent, Calendar as CalendarIcon,
} from "lucide-react";

interface RateData {
  date: string;
  amount: number;
  season?: "alta" | "media" | "baja";
}

interface RoomType {
  id: number;
  name: string;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const SEASONS = [
  { value: "baja", label: "Baja", color: "bg-sage-100 text-sage-700 border-sage-300" },
  { value: "media", label: "Media", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "alta", label: "Alta", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= lastDay; i++) days.push(i);
  return days;
}

function getSeasonBg(season?: string): string {
  switch (season) {
    case "alta": return "bg-red-50 border-red-200";
    case "media": return "bg-amber-50 border-amber-200";
    case "baja": return "bg-sage-50 border-sage-200";
    default: return "bg-card border-border";
  }
}

function getSeasonBadge(season?: string) {
  switch (season) {
    case "alta": return { label: "Alta", className: "bg-red-100 text-red-700" };
    case "media": return { label: "Media", className: "bg-amber-100 text-amber-700" };
    case "baja": return { label: "Baja", className: "bg-sage-100 text-sage-700" };
    default: return null;
  }
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatCOP(amount: number): string {
  return "$" + Math.round(amount).toLocaleString("es-CO");
}

export default function TarifasPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [rates, setRates] = useState<Record<string, RateData>>({});
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editDay, setEditDay] = useState<{
    date: string; day: number; amount: number; season: string;
  } | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [editSeason, setEditSeason] = useState("media");
  const [saving, setSaving] = useState(false);

  // Bulk modal state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkFrom, setBulkFrom] = useState("");
  const [bulkTo, setBulkTo] = useState("");
  const [bulkAmount, setBulkAmount] = useState(0);
  const [bulkSeason, setBulkSeason] = useState("media");
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const from = formatDate(year, month, 1);
      const to = formatDate(year, month, daysInMonth);

      const [rtRes] = await Promise.allSettled([
        api.get<RoomType[]>("/room-types"),
      ]);
      if (rtRes.status === "fulfilled") {
        const data = rtRes.value.data;
        const rts = Array.isArray(data) ? data : [];
        setRoomTypes(rts);
        const rtId = selectedRoomType || rts[0]?.id;
        if (rtId) {
          setSelectedRoomType(rtId);
          const rateRes = await api.get<RateData[]>(`/rates/${rtId}?from=${from}&to=${to}`);
          const rateMap: Record<string, RateData> = {};
          (Array.isArray(rateRes.data) ? rateRes.data : []).forEach((r: RateData) => {
            rateMap[r.date] = r;
          });
          setRates(rateMap);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [year, month, selectedRoomType]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const days = getMonthGrid(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleDayTap = (day: number) => {
    const date = formatDate(year, month, day);
    const rate = rates[date];
    setEditDay({
      date,
      day,
      amount: rate?.amount ?? 0,
      season: rate?.season ?? "media",
    });
    setEditAmount(rate?.amount ?? 0);
    setEditSeason(rate?.season ?? "media");
  };

  const handleSaveDay = async () => {
    if (!editDay || !selectedRoomType) return;
    setSaving(true);
    try {
      await api.patch(`/rates/${selectedRoomType}/${editDay.date}`, {
        amount: editAmount,
        season: editSeason,
      });
      setRates((prev) => ({
        ...prev,
        [editDay.date]: { date: editDay.date, amount: editAmount, season: editSeason as RateData["season"] },
      }));
      setEditDay(null);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async () => {
    if (!selectedRoomType || !bulkFrom || !bulkTo) return;
    setBulkSaving(true);
    try {
      await api.post("/rates/bulk", {
        roomTypeId: selectedRoomType,
        from: bulkFrom,
        to: bulkTo,
        amount: bulkAmount,
        season: bulkSeason,
      });
      setShowBulk(false);
      fetchRates();
    } catch {
      // ignore
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="px-5 pb-9 pt-3">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-0.5">
          <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-text">
            Tarifas
          </h1>
          <button
            onClick={() => setShowBulk(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-terracota-50 px-3.5 py-2 text-xs font-semibold text-terracota-600"
          >
            <Percent size={14} />
            Ajuste masivo
          </button>
        </div>

        {/* Room type selector */}
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
          {roomTypes.map((rt) => (
            <button
              key={rt.id}
              onClick={() => setSelectedRoomType(rt.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                selectedRoomType === rt.id
                  ? "bg-slate-900 text-white"
                  : "border border-border bg-card text-text hover:bg-surface-2"
              }`}
            >
              {rt.name}
            </button>
          ))}
        </div>

        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-xs">
          <button onClick={prevMonth} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
            <ChevronLeft size={20} />
          </button>
          <div className="font-display text-lg font-bold text-text">
            {MONTHS[month]} {year}
          </div>
          <button onClick={nextMonth} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => <div key={d} className="h-4 rounded bg-border" />)}
            </div>
            {[1, 2, 3, 4, 5, 6].map((r) => (
              <div key={r} className="grid grid-cols-7 gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                  <div key={c} className="aspect-square rounded-md bg-border" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} className="aspect-square" />;
                const date = formatDate(year, month, day);
                const rate = rates[date];
                const amount = rate?.amount ?? 0;
                const season = rate?.season;
                const isToday = date === formatDate(today.getFullYear(), today.getMonth(), today.getDate());

                return (
                  <button
                    key={date}
                    onClick={() => handleDayTap(day)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-md border text-xs transition-all hover:shadow-sm ${getSeasonBg(season)} ${
                      isToday ? "ring-2 ring-terracota-500" : ""
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isToday ? "text-terracota-600" : "text-text"}`}>
                      {day}
                    </span>
                    <span className="mt-0.5 text-[8px] tabular-nums text-muted leading-tight">
                      {amount > 0 ? formatCOP(amount) : "—"}
                    </span>
                    {season && (
                      <div className={`mt-0.5 h-1 w-full max-w-[16px] rounded-full ${
                        season === "alta" ? "bg-red-400" : season === "media" ? "bg-amber-400" : "bg-sage-400"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Season legend */}
            <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-border bg-card px-4 py-3">
              {SEASONS.map((s) => (
                <div key={s.value} className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    s.value === "alta" ? "bg-red-400" : s.value === "media" ? "bg-amber-400" : "bg-sage-400"
                  }`} />
                  {s.label}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit day modal (bottom sheet) */}
        {editDay && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditDay(null)} />
            <div className="relative w-full max-w-md rounded-t-2xl bg-card px-6 pb-10 pt-6 shadow-xl">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-text">
                  {editDay.day} de {MONTHS[month]} {year}
                </h3>
                <button onClick={() => setEditDay(null)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                  <X size={18} />
                </button>
              </div>
              <p className="mb-5 text-sm text-muted">Editar tarifa y temporada</p>

              {/* Amount input */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-text">Precio por noche (COP)</label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-muted">$</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-surface-2 py-3.5 pl-8 pr-3.5 text-lg font-semibold text-text tabular-nums focus:border-slate-900 focus:bg-card focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Season selector */}
              <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold text-text">Temporada</label>
                <div className="flex gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setEditSeason(s.value)}
                      className={`flex-1 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${
                        editSeason === s.value ? s.color + " border-2" : "border-border bg-surface-2 text-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditDay(null)}
                  className="flex-1 rounded-full border border-border bg-card py-3 text-sm font-semibold text-text"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveDay}
                  disabled={saving}
                  className="flex-1 rounded-full bg-terracota-500 py-3 text-sm font-semibold text-white hover:bg-terracota-600 disabled:opacity-60"
                >
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk adjustment modal */}
        {showBulk && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowBulk(false)} />
            <div className="relative w-full max-w-md rounded-t-2xl bg-card px-6 pb-10 pt-6 shadow-xl">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-text">Ajuste por temporada</h3>
                <button onClick={() => setShowBulk(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                  <X size={18} />
                </button>
              </div>
              <p className="mb-5 text-sm text-muted">Aplica una tarifa a un rango de fechas</p>

              {/* Date range */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text">Desde</label>
                  <input
                    type="date"
                    value={bulkFrom}
                    onChange={(e) => setBulkFrom(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-3 text-sm text-text focus:border-slate-900 focus:bg-card focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-text">Hasta</label>
                  <input
                    type="date"
                    value={bulkTo}
                    onChange={(e) => setBulkTo(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface-2 px-3.5 py-3 text-sm text-text focus:border-slate-900 focus:bg-card focus:outline-none"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold text-text">Precio por noche (COP)</label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-muted">$</span>
                  <input
                    type="number"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-surface-2 py-3.5 pl-8 pr-3.5 text-base font-semibold text-text tabular-nums focus:border-slate-900 focus:bg-card focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Season */}
              <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold text-text">Temporada</label>
                <div className="flex gap-2">
                  {SEASONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setBulkSeason(s.value)}
                      className={`flex-1 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${
                        bulkSeason === s.value ? s.color + " border-2" : "border-border bg-surface-2 text-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBulkSave}
                disabled={bulkSaving || !bulkFrom || !bulkTo}
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-terracota-500 text-base font-semibold text-white hover:bg-terracota-600 disabled:opacity-60"
              >
                {bulkSaving ? "Aplicando…" : "Aplicar ajuste"}
              </button>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
