import type { ReactNode } from "react";
import AdminGuard from "@/components/AdminGuard";
import AdminSidebar from "@/components/AdminSidebar";
import AdminTopbar from "@/components/AdminTopbar";

export const metadata = {
  title: {
    default: "Admin — Habidex",
    template: "%s — Admin Habidex",
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <div
        className="flex min-h-screen bg-bg"
        style={{ fontFamily: "var(--font-body), Inter, sans-serif" }}
      >
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
