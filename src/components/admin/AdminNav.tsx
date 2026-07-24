import Link from "next/link";
import { logout } from "@/app/admin/(protected)/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード" },
  { href: "/admin/buildings", label: "建物一覧" },
  { href: "/admin/units", label: "募集住戸一覧" },
  { href: "/admin/inquiries", label: "問い合わせ一覧" },
  { href: "/admin/updates", label: "更新期限一覧" },
  { href: "/admin/company", label: "会社情報設定" },
  { href: "/admin/equipment", label: "設備マスター" },
];

export function AdminNav({ adminName }: { adminName: string }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-bold text-brand-700">
            トラベルエステート 管理画面
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-brand-600">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span>{adminName} さん</span>
          <form action={logout}>
            <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
