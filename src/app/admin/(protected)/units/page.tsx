import Link from "next/link";
import type { Metadata } from "next";
import { listUnitsForAdmin } from "@/lib/data/admin-units";
import { RECRUITING_STATUS, RECRUITING_STATUS_LABEL, PUBLICATION_STATUS_LABEL } from "@/lib/constants";
import { formatRentManYen } from "@/lib/format";
import { getUpdateUrgency } from "@/lib/update-schedule";

export const metadata: Metadata = { title: "募集住戸一覧" };

export default async function AdminUnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ recruitingStatus?: string }>;
}) {
  const { recruitingStatus } = await searchParams;
  const allUnits = await listUnitsForAdmin();
  const units = recruitingStatus ? allUnits.filter((u) => u.recruitingStatus === recruitingStatus) : allUnits;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">募集住戸一覧</h1>
        <Link href="/admin/units/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          + 新規登録
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/admin/units" className={`rounded-full border px-3 py-1.5 ${!recruitingStatus ? "border-brand-600 text-brand-700" : "border-neutral-300"}`}>
          すべて
        </Link>
        {Object.values(RECRUITING_STATUS).map((s) => (
          <Link
            key={s}
            href={`/admin/units?recruitingStatus=${s}`}
            className={`rounded-full border px-3 py-1.5 ${recruitingStatus === s ? "border-brand-600 text-brand-700" : "border-neutral-300"}`}
          >
            {RECRUITING_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">建物名/部屋番号</th>
              <th className="px-4 py-3">賃料</th>
              <th className="px-4 py-3">募集状態</th>
              <th className="px-4 py-3">公開状態</th>
              <th className="px-4 py-3">次回更新予定日</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => {
              const urgency = getUpdateUrgency(u.nextUpdateDueAt);
              return (
                <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {u.building.name} {u.roomNumber}
                  </td>
                  <td className="px-4 py-3">{formatRentManYen(u.rent)}</td>
                  <td className="px-4 py-3">{RECRUITING_STATUS_LABEL[u.recruitingStatus as keyof typeof RECRUITING_STATUS_LABEL] ?? u.recruitingStatus}</td>
                  <td className="px-4 py-3">{PUBLICATION_STATUS_LABEL[u.publicationStatus as keyof typeof PUBLICATION_STATUS_LABEL] ?? u.publicationStatus}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        urgency === "overdue"
                          ? "font-semibold text-red-600"
                          : urgency === "upcoming"
                            ? "font-semibold text-amber-600"
                            : "text-neutral-600"
                      }
                    >
                      {u.nextUpdateDueAt ? new Date(u.nextUpdateDueAt).toLocaleDateString("ja-JP") : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/units/${u.id}`} className="text-brand-700 hover:underline">
                      編集
                    </Link>
                  </td>
                </tr>
              );
            })}
            {units.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  該当する住戸がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
