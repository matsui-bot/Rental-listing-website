import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav adminName={session.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
