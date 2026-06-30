"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

interface RoomType {
  id: number;
  name: string;
  totalRooms: number;
}

interface DayInventory {
  date: string;
  available: number;
  total: number;
  occupied: number;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0, Sunday = 6
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const totalDays = lastDay.getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);
  return days;
}

function getOccupancyColor(pct: number): string {
  if (pct > 70) return "bg-sage-500";
  if (pct > 30) return "bg-amber-500";
  return "bg-red-500";
}

function getOccupancyBg(pct: number): string {
  if (pct > 70) return "bg-sage-100 text-sage-700";
  if (pct > 30) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [inventory, setInventory] = useState<Record<string, DayInventory>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    day: number;
    available: number;
    total: number;
  } | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const from = formatDate(year, month, 1);
      const to = formatDate(year, month, daysInMonth);

      const [invRes, rtRes] = await Promise.allSettled([
        api.get<DayInventory[]>(`/inventory/bulk?from=${from}&to=${to}`),
        api.get<RoomType[]>("/room-types"),
      ]);

      if (invRes.status === "fulfilled") {
        const invMap: Record<string, DayInventory> = {};
        const data = invRes.value.data;
        (Array.isArray(data) ? data : []).forEach((d: DayInventory) => {
          invMap[d.date] = d;
        });
        setInventory(invMap);
      }
      if (rtRes.status === "fulfilled") {
        const data = rtRes.value.data;
        setRoomTypes(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const days = getMonthGrid(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0) || 30;

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
    const inv = inventory[date];
    const avail = inv?.available ?? totalRooms;
    const total = inv?.total ?? totalRooms;
    setSelectedDay({ date, day, available: avail, total });
    setEditValue(avail);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      // Find the room type ID (first one or bulk)
      if (roomTypes.length > 0) {
        await Promise.all(
          roomTypes.map((rt) =>
            api.patch(`/inventory/${rt.id}/${selectedDay.date}`, {
              available: Math.min(editValue, rt.totalRooms),
            })
          )
        );
      }
      setInventory((prev) => ({
        ...prev,
        [selectedDay.date]: {
          ...prev[selectedDay.date],
          available: editValue,
          total: totalRooms,
          occupied: totalRooms - editValue,
          date: selectedDay.date,
        },
      }));
      setSelectedDay(null);
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="px-5 pb-9 pt-3">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between px-0.5">
          <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-text">
            Disponibilidad
          </h1>
        </div>

        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-xs">
          <button onClick={prevMonth} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="font-display text-lg font-bold text-text">
              {MONTHS[month]} {year}
            </div>
            {!loading && (
              <div className="text-[11px] text-muted">
                {totalRooms} habitaciones
              </div>
            )}
          </div>
          <button onClick={nextMonth} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="h-4 rounded bg-border" />
              ))}
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
            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }
                const date = formatDate(year, month, day);
                const inv = inventory[date];
                const avail = inv?.available ?? totalRooms;
                const total = inv?.total ?? totalRooms;
                const pct = total > 0 ? ((total - avail) / total) * 100 : 0;
                const isToday = date === formatDate(today.getFullYear(), today.getMonth(), today.getDate());

                return (
                  <button
                    key={date}
                    onClick={() => handleDayTap(day)}
                    className={`relative flex aspect-square flex-col items-center justify-center rounded-md border text-xs transition-all hover:shadow-sm ${
                      isToday
                        ? "border-terracota-500 bg-terracota-50"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isToday ? "text-terracota-600" : "text-text"}`}>
                      {day}
                    </span>
                    <span className="mt-0.5 text-[9px] tabular-nums text-muted">
                      {avail}/{total}
                    </span>
                    {/* Mini occupancy bar */}
                    <div className="mt-0.5 h-1 w-full max-w-[20px] overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${getOccupancyColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-sage-500" />
                &gt;70%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                30-70%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                &lt;30%
              </div>
            </div>
          </>
        )}

        {/* Bottom sheet modal */}
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedDay(null)} />
            <div className="relative w-full max-w-md rounded-t-2xl bg-card px-6 pb-10 pt-6 shadow-xl">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-text">
                  {selectedDay.day} de {MONTHS[month]} {year}
                </h3>
                <button onClick={() => setSelectedDay(null)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                  <X size={18} />
                </button>
              </div>
              <p className="mb-5 text-sm text-muted">
                Ajustar disponibilidad — {totalRooms} habitaciones totales
              </p>

              <div className="mb-6 flex items-center justify-center gap-6">
                <button
                  onClick={() => setEditValue((v) => Math.max(0, v - 1))}
                  className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-2 text-text hover:bg-border"
                >
                  <Minus size={22} />
                </button>
                <div className="text-center">
                  <div className="font-display text-4xl font-bold text-text tabular-nums">
                    {editValue}
                  </div>
                  <div className="text-xs text-muted">disponibles de {totalRooms}</div>
                </div>
                <button
                  onClick={() => setEditValue((v) => Math.min(totalRooms, v + 1))}
                  className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-2 text-text hover:bg-border"
                >
                  <Plus size={22} />
                </button>
              </div>

              {/* Occupancy indicator */}
              <div className="mb-6">
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span>Ocupación</span>
                  <span className="tabular-nums font-semibold text-text">
                    {totalRooms - editValue}/{totalRooms} ({Math.round(((totalRooms - editValue) / totalRooms) * 100)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full rounded-full transition-all ${getOccupancyColor(((totalRooms - editValue) / totalRooms) * 100)}`}
                    style={{ width: `${((totalRooms - editValue) / totalRooms) * 100}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAvailability}
                disabled={saving}
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-terracota-500 text-base font-semibold text-white transition-colors hover:bg-terracota-600 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar disponibilidad"}
              </button>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
