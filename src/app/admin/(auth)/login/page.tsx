import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-session";
import { LoginForm } from "./LoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-lg font-bold text-neutral-900">管理画面ログイン</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">トラベルエステート株式会社</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
