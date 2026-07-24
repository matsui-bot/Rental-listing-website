import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BuildingForm, type BuildingFormDefaults } from "@/components/admin/BuildingForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { updateBuilding, deleteBuilding } from "../actions";
import { RECRUITING_STATUS_LABEL, PUBLICATION_STATUS_LABEL } from "@/lib/constants";
import { formatRentManYen } from "@/lib/format";

export const metadata: Metadata = { title: "建物の編集" };

export default async function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const building = await prisma.building.findUnique({
    where: { id, isDeleted: false },
    include: {
      stations: { orderBy: { order: "asc" } },
      photos: { orderBy: { order: "asc" } },
      units: { where: { isDeleted: false }, orderBy: { roomNumber: "asc" } },
    },
  });
  if (!building) notFound();

  const defaults: BuildingFormDefaults = {
    name: building.name,
    nameKana: building.nameKana ?? "",
    postalCode: building.postalCode,
    prefecture: building.prefecture,
    city: building.city,
    addressLine: building.addressLine,
    addressLine2: building.addressLine2 ?? "",
    latitude: building.latitude?.toString() ?? "",
    longitude: building.longitude?.toString() ?? "",
    addressDisclosureLevel: building.addressDisclosureLevel,
    structure: building.structure,
    totalFloors: String(building.totalFloors),
    totalUnits: building.totalUnits?.toString() ?? "",
    builtYearMonth: building.builtYearMonth,
    busInfo: building.busInfo ?? "",
    parkingInfo: building.parkingInfo ?? "",
    surroundingInfo: building.surroundingInfo ?? "",
    commonFacilitiesNote: building.commonFacilitiesNote ?? "",
    stations: building.stations.map((s) => ({
      id: s.id,
      lineName: s.lineName,
      stationName: s.stationName,
      walkMinutes: s.walkMinutes,
      busMinutes: s.busMinutes,
    })),
  };

  const boundUpdate = updateBuilding.bind(null, building.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">建物の編集: {building.name}</h1>
        <DeleteButton
          action={deleteBuilding.bind(null, building.id)}
          confirmMessage={`「${building.name}」を削除しますか?(募集住戸が残っている場合は削除できません)`}
        />
      </div>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold text-neutral-800">基本情報</h2>
        <BuildingForm action={boundUpdate} defaults={defaults} submitLabel="保存する" />
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold text-neutral-800">建物写真(外観・共用部分など)</h2>
        <PhotoManager targetType="BUILDING" targetId={building.id} initialPhotos={building.photos} />
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800">この建物の募集住戸</h2>
          <Link href={`/admin/units/new?buildingId=${building.id}`} className="text-sm font-semibold text-brand-700 hover:underline">
            + 住戸を追加
          </Link>
        </div>
        {building.units.length === 0 ? (
          <p className="text-sm text-neutral-400">住戸が登録されていません。</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="py-2">部屋番号</th>
                <th className="py-2">賃料</th>
                <th className="py-2">募集状態</th>
                <th className="py-2">公開状態</th>
                <th className="py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {building.units.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2">{u.roomNumber}</td>
                  <td className="py-2">{formatRentManYen(u.rent)}</td>
                  <td className="py-2">{RECRUITING_STATUS_LABEL[u.recruitingStatus as keyof typeof RECRUITING_STATUS_LABEL] ?? u.recruitingStatus}</td>
                  <td className="py-2">{PUBLICATION_STATUS_LABEL[u.publicationStatus as keyof typeof PUBLICATION_STATUS_LABEL] ?? u.publicationStatus}</td>
                  <td className="py-2">
                    <Link href={`/admin/units/${u.id}`} className="text-brand-700 hover:underline">
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
