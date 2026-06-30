import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import { DashboardDesktop, DashboardMobile } from "@/components/DashboardContent";

export const metadata: Metadata = {
  title: "Panel",
};

export default function DashboardPage() {
  return (
    <LayoutWrapper>
      {/* Desktop */}
      <div className="hidden md:block">
        <DashboardDesktop />
      </div>
      {/* Mobile */}
      <div className="block md:hidden">
        <DashboardMobile />
      </div>
    </LayoutWrapper>
  );
}
