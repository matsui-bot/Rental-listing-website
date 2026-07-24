import Link from "next/link";
import { getDashboardStats } from "@/lib/data/admin-units";
import { enforceOverdueAutoUnpublish } from "@/lib/overdue-enforcement";

const STAT_CARDS = [
  { key: "recruitingCount", label: "募集中物件数", href: "/admin/units?recruitingStatus=RECRUITING" },
  { key: "applicationReceivedCount", label: "申込あり物件数", href: "/admin/units?recruitingStatus=APPLICATION_RECEIVED" },
  { key: "upcomingCount", label: "更新期限が近い物件数", href: "/admin/updates" },
  { key: "overdueCount", label: "更新期限を過ぎた物件数", href: "/admin/updates" },
  { key: "pendingInquiryCount", label: "未対応問い合わせ数", href: "/admin/inquiries?status=NEW" },
] as const;

export default async function AdminDashboardPage() {
  const autoUnpublishedCount = await enforceOverdueAutoUnpublish();
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">ダッシュボード</h1>

      {autoUnpublishedCount > 0 && (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          更新期限を超過した{autoUnpublishedCount}件の住戸を自動的に非公開にしました(会社情報設定で「自動的に非公開」が選択されているため)。
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAT_CARDS.map((card) => {
          const value = stats[card.key];
          const isAlert =
            (card.key === "overdueCount" || card.key === "pendingInquiryCount") && value > 0;
          const isWarn = card.key === "upcomingCount" && value > 0;
          return (
            <Link
              key={card.key}
              href={card.href}
              className={`rounded-lg border p-5 transition hover:shadow-md ${
                isAlert
                  ? "border-red-300 bg-red-50"
                  : isWarn
                    ? "border-amber-300 bg-amber-50"
                    : "border-neutral-200 bg-white"
              }`}
            >
              <p className="text-sm text-neutral-500">{card.label}</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  isAlert ? "text-red-700" : isWarn ? "text-amber-700" : "text-neutral-900"
                }`}
              >
                {value}
                <span className="ml-1 text-base font-normal">件</span>
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/buildings/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          + 建物を新規登録
        </Link>
        <Link href="/admin/units/new" className="rounded-md border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700">
          + 募集住戸を新規登録
        </Link>
      </div>
    </div>
  );
}
