import type { Metadata } from "next";
import { listBuildingOptions, listEquipmentMaster } from "@/lib/data/admin-units";
import { UnitForm, emptyUnitFormDefaults } from "@/components/admin/UnitForm";
import { createUnit } from "../actions";

export const metadata: Metadata = { title: "募集住戸の新規登録" };

export default async function NewUnitPage({
  searchParams,
}: {
  searchParams: Promise<{ buildingId?: string }>;
}) {
  const { buildingId } = await searchParams;
  const [buildingOptions, equipmentOptions] = await Promise.all([listBuildingOptions(), listEquipmentMaster()]);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">募集住戸の新規登録</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <UnitForm
          action={createUnit}
          defaults={{ ...emptyUnitFormDefaults, buildingId: buildingId ?? "" }}
          submitLabel="登録する"
          buildingOptions={buildingOptions}
          equipmentOptions={equipmentOptions}
        />
      </div>
    </div>
  );
}
