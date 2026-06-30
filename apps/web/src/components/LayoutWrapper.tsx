"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isDesktop) {
    return (
      <div className="grid min-h-screen" style={{ gridTemplateColumns: "240px 1fr" }}>
        <Sidebar />
        <div>
          <Topbar />
          <main className="mx-auto w-full max-w-[1400px] px-8 py-7">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[72px]">
      <main className="mx-auto w-full max-w-[1400px]">{children}</main>
      <BottomNav />
    </div>
  );
}
