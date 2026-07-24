import Link from "next/link";
import type { Metadata } from "next";
import { listBuildingsForAdmin } from "@/lib/data/admin-units";
import { deleteBuilding } from "./actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatYearMonth } from "@/lib/format";

export const metadata: Metadata = { title: "建物一覧" };

export default async function AdminBuildingsPage() {
  const buildings = await listBuildingsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">建物一覧</h1>
        <Link href="/admin/buildings/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
          + 新規登録
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">建物名</th>
              <th className="px-4 py-3">所在地</th>
              <th className="px-4 py-3">構造/築年月</th>
              <th className="px-4 py-3">住戸数</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((b) => (
              <tr key={b.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-900">{b.name}</td>
                <td className="px-4 py-3 text-neutral-600">{b.prefecture}{b.city}</td>
                <td className="px-4 py-3 text-neutral-600">{b.structure} / {formatYearMonth(b.builtYearMonth)}</td>
                <td className="px-4 py-3 text-neutral-600">{b._count.units}戸</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/buildings/${b.id}`} className="text-brand-700 hover:underline">
                      編集
                    </Link>
                    <DeleteButton
                      action={deleteBuilding.bind(null, b.id)}
                      confirmMessage={`「${b.name}」を削除しますか?(募集住戸が残っている場合は削除できません)`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {buildings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  建物が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
