import type { Metadata } from "next";
import { BuildingForm, emptyBuildingFormDefaults } from "@/components/admin/BuildingForm";
import { createBuilding } from "../actions";

export const metadata: Metadata = { title: "建物の新規登録" };

export default function NewBuildingPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">建物の新規登録</h1>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <BuildingForm action={createBuilding} defaults={emptyBuildingFormDefaults} submitLabel="登録する" />
      </div>
    </div>
  );
}
