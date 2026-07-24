"use client";

import { useActionState } from "react";
import { createEquipment, type EquipmentActionState } from "./actions";
import { EQUIPMENT_SCOPE } from "@/lib/constants";

export function EquipmentAddForm() {
  const [state, formAction, isPending] = useActionState(createEquipment, { status: "idle" } as EquipmentActionState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3 rounded-md border border-dashed border-neutral-300 p-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        設備名
        <input name="name" required maxLength={50} className="rounded-md border border-neutral-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        区分
        <select name="scope" defaultValue="UNIT" className="rounded-md border border-neutral-300 px-3 py-2">
          <option value={EQUIPMENT_SCOPE.UNIT}>住戸設備</option>
          <option value={EQUIPMENT_SCOPE.BUILDING}>建物設備</option>
          <option value={EQUIPMENT_SCOPE.BOTH}>両方</option>
        </select>
      </label>
      <button type="submit" disabled={isPending} className="tap-target rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {isPending ? "追加中..." : "追加する"}
      </button>
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}
