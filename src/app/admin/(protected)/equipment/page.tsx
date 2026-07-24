import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EquipmentAddForm } from "./EquipmentAddForm";
import { deleteEquipment } from "./actions";

export const metadata: Metadata = { title: "設備マスター" };

const SCOPE_LABEL: Record<string, string> = { BUILDING: "建物設備", UNIT: "住戸設備", BOTH: "両方" };

export default async function AdminEquipmentPage() {
  const equipment = await prisma.equipmentMaster.findMany({ orderBy: [{ order: "asc" }] });

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">設備マスター</h1>
      <p className="mt-1 text-sm text-neutral-500">ここに登録した設備が、募集住戸の「設備・条件」入力画面で選択できるようになります。</p>

      <div className="mt-6">
        <EquipmentAddForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">設備名</th>
              <th className="px-4 py-3">区分</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => (
              <tr key={eq.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium text-neutral-900">{eq.name}</td>
                <td className="px-4 py-3 text-neutral-600">{SCOPE_LABEL[eq.scope] ?? eq.scope}</td>
                <td className="px-4 py-3">
                  <DeleteButton action={deleteEquipment.bind(null, eq.id)} confirmMessage={`「${eq.name}」を削除しますか?`} />
                </td>
              </tr>
            ))}
            {equipment.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-400">
                  設備が登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
