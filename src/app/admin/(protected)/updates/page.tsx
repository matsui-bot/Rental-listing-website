import Link from "next/link";
import type { Metadata } from "next";
import { listUnitsWithUpdateSchedule } from "@/lib/data/admin-units";
import { enforceOverdueAutoUnpublish } from "@/lib/overdue-enforcement";
import { getUpdateUrgency } from "@/lib/update-schedule";
import { formatDate } from "@/lib/format";
import { QuickConfirmUpdateButton } from "@/components/admin/QuickConfirmUpdateButton";

export const metadata: Metadata = { title: "更新期限一覧" };

const URGENCY_LABEL = { overdue: "期限超過", upcoming: "期限間近", normal: "問題なし" } as const;

export default async function AdminUpdatesPage() {
  await enforceOverdueAutoUnpublish();
  const units = await listUnitsWithUpdateSchedule();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">更新期限一覧</h1>
      <p className="mt-1 text-sm text-neutral-500">公開中の住戸を次回更新予定日が近い順に表示しています。</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">建物名/部屋番号</th>
              <th className="px-4 py-3">最終更新日</th>
              <th className="px-4 py-3">次回更新予定日</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => {
              const urgency = getUpdateUrgency(u.nextUpdateDueAt);
              return (
                <tr
                  key={u.id}
                  className={`border-b border-neutral-100 last:border-0 ${
                    urgency === "overdue" ? "bg-red-50" : urgency === "upcoming" ? "bg-amber-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {u.building.name} {u.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(u.lastUpdatedAt)}</td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(u.nextUpdateDueAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        urgency === "overdue"
                          ? "font-semibold text-red-700"
                          : urgency === "upcoming"
                            ? "font-semibold text-amber-700"
                            : "text-neutral-600"
                      }
                    >
                      {URGENCY_LABEL[urgency]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/units/${u.id}`} className="text-brand-700 hover:underline">
                        編集
                      </Link>
                      <QuickConfirmUpdateButton unitId={u.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {units.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  公開中の住戸がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
