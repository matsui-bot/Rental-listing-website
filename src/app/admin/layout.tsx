import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "管理画面", template: "%s｜管理画面" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
