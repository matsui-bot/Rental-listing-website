import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUnitForEdit, listBuildingOptions, listEquipmentMaster } from "@/lib/data/admin-units";
import { UnitForm, type UnitFormDefaults } from "@/components/admin/UnitForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { UnitStatusControls } from "@/components/admin/UnitStatusControls";
import { updateUnit } from "../actions";

export const metadata: Metadata = { title: "募集住戸の編集" };

export default async function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [unit, buildingOptions, equipmentOptions] = await Promise.all([
    getUnitForEdit(id),
    listBuildingOptions(),
    listEquipmentMaster(),
  ]);
  if (!unit) notFound();

  const defaults: UnitFormDefaults = {
    buildingId: unit.buildingId,
    managementNumber: unit.managementNumber,
    roomNumber: unit.roomNumber,
    floor: unit.floor?.toString() ?? "",
    layoutType: unit.layoutType,
    exclusiveArea: unit.exclusiveArea.toString(),
    direction: unit.direction ?? "",
    rent: unit.rent.toString(),
    managementFee: unit.managementFee?.toString() ?? "",
    commonServiceFee: unit.commonServiceFee?.toString() ?? "",
    deposit: unit.deposit?.toString() ?? "",
    keyMoney: unit.keyMoney?.toString() ?? "",
    guaranteeDeposit: unit.guaranteeDeposit?.toString() ?? "",
    amortization: unit.amortization?.toString() ?? "",
    guarantorCompanyFee: unit.guarantorCompanyFee?.toString() ?? "",
    fireInsuranceFee: unit.fireInsuranceFee?.toString() ?? "",
    keyExchangeFee: unit.keyExchangeFee?.toString() ?? "",
    cleaningFee: unit.cleaningFee?.toString() ?? "",
    renewalFee: unit.renewalFee?.toString() ?? "",
    contractPeriod: unit.contractPeriod ?? "",
    contractType: unit.contractType ?? "",
    availableDate: unit.availableDate ?? "",
    currentStatus: unit.currentStatus ?? "",
    recruitingConditions: unit.recruitingConditions ?? "",
    catchCopy: unit.catchCopy ?? "",
    remarks: unit.remarks ?? "",
    specialTerms: unit.specialTerms ?? "",
    transactionType: unit.transactionType ?? "",
    featureTags: unit.featureTags ?? "",
    otherCosts: unit.otherCosts.map((c) => ({
      name: c.name,
      amount: c.amount.toString(),
      taxType: c.taxType,
      isRequired: c.isRequired,
      remarks: c.remarks ?? "",
    })),
    equipmentIds: unit.equipment.map((e) => e.equipmentId),
  };

  const boundUpdate = updateUnit.bind(null, unit.id);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">
        募集住戸の編集: {unit.building.name} {unit.roomNumber}
      </h1>

      <div className="mt-6">
        <UnitStatusControls
          unitId={unit.id}
          recruitingStatus={unit.recruitingStatus}
          publicationStatus={unit.publicationStatus}
          publishedAt={unit.publishedAt}
          lastUpdatedAt={unit.lastUpdatedAt}
          nextUpdateDueAt={unit.nextUpdateDueAt}
        />
      </div>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold text-neutral-800">基本情報</h2>
        <UnitForm
          action={boundUpdate}
          defaults={defaults}
          submitLabel="保存する"
          buildingOptions={buildingOptions}
          equipmentOptions={equipmentOptions}
        />
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold text-neutral-800">住戸写真</h2>
        <PhotoManager targetType="UNIT" targetId={unit.id} initialPhotos={unit.photos} />
      </section>
    </div>
  );
}
