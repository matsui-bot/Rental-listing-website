"use client";

import { useActionState, useState } from "react";
import { LAYOUT_TYPES, CONTRACT_TYPE_LABEL, TRANSACTION_TYPE_LABEL, TAX_TYPE_LABEL } from "@/lib/constants";
import type { UnitActionState } from "@/app/admin/(protected)/units/actions";

export interface UnitFormOtherCost {
  name: string;
  amount: string;
  taxType: string;
  isRequired: boolean;
  remarks?: string;
}

export interface UnitFormDefaults {
  buildingId: string;
  managementNumber: string;
  roomNumber: string;
  floor: string;
  layoutType: string;
  exclusiveArea: string;
  direction: string;
  rent: string;
  managementFee: string;
  commonServiceFee: string;
  deposit: string;
  keyMoney: string;
  guaranteeDeposit: string;
  amortization: string;
  guarantorCompanyFee: string;
  fireInsuranceFee: string;
  keyExchangeFee: string;
  cleaningFee: string;
  renewalFee: string;
  contractPeriod: string;
  contractType: string;
  availableDate: string;
  currentStatus: string;
  recruitingConditions: string;
  catchCopy: string;
  remarks: string;
  specialTerms: string;
  transactionType: string;
  featureTags: string;
  otherCosts: UnitFormOtherCost[];
  equipmentIds: string[];
}

export const emptyUnitFormDefaults: UnitFormDefaults = {
  buildingId: "",
  managementNumber: "",
  roomNumber: "",
  floor: "",
  layoutType: "1K",
  exclusiveArea: "",
  direction: "",
  rent: "",
  managementFee: "",
  commonServiceFee: "",
  deposit: "",
  keyMoney: "",
  guaranteeDeposit: "",
  amortization: "",
  guarantorCompanyFee: "",
  fireInsuranceFee: "",
  keyExchangeFee: "",
  cleaningFee: "",
  renewalFee: "",
  contractPeriod: "2年間",
  contractType: "NORMAL",
  availableDate: "",
  currentStatus: "",
  recruitingConditions: "",
  catchCopy: "",
  remarks: "",
  specialTerms: "",
  transactionType: "BROKERAGE",
  featureTags: "",
  otherCosts: [],
  equipmentIds: [],
};

export function UnitForm({
  action,
  defaults,
  submitLabel,
  buildingOptions,
  equipmentOptions,
}: {
  action: (state: UnitActionState, formData: FormData) => Promise<UnitActionState>;
  defaults: UnitFormDefaults;
  submitLabel: string;
  buildingOptions: { id: string; name: string }[];
  equipmentOptions: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(action, { status: "idle" } as UnitActionState);
  const [otherCosts, setOtherCosts] = useState<UnitFormOtherCost[]>(defaults.otherCosts ?? []);
  const [equipmentIds, setEquipmentIds] = useState<string[]>(defaults.equipmentIds ?? []);
  const fieldErrors = state.fieldErrors ?? {};
  const safeBuildingOptions = buildingOptions ?? [];
  const safeEquipmentOptions = equipmentOptions ?? [];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="otherCostsJson" value={JSON.stringify(otherCosts)} />

      {state.status === "error" && state.message && (
        <div role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <p>{state.message}</p>
          {Object.keys(fieldErrors).length > 0 && (
            <ul className="mt-2 list-inside list-disc font-normal">
              {Object.entries(fieldErrors).map(([field, messages]) => (
                <li key={field}>{messages?.[0]}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {state.status === "idle" && state.message && (
        <p role="status" className="rounded-md bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
          {state.message}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          建物<span className="ml-1 text-red-600">必須</span>
          <select name="buildingId" defaultValue={defaults.buildingId} required className="rounded-md border border-neutral-300 px-3 py-2">
            <option value="">選択してください</option>
            {safeBuildingOptions.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {fieldErrors.buildingId && <span className="text-xs text-red-600">{fieldErrors.buildingId[0]}</span>}
        </label>
        <Field label="管理番号" name="managementNumber" required defaultValue={defaults.managementNumber} error={fieldErrors.managementNumber} />
        <Field label="部屋番号" name="roomNumber" required defaultValue={defaults.roomNumber} error={fieldErrors.roomNumber} />
        <Field label="所在階(任意)" name="floor" type="number" defaultValue={defaults.floor} />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          間取り<span className="ml-1 text-red-600">必須</span>
          <select name="layoutType" defaultValue={defaults.layoutType} className="rounded-md border border-neutral-300 px-3 py-2">
            {LAYOUT_TYPES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>
        <Field label="専有面積(m²)" name="exclusiveArea" type="number" step="0.1" required defaultValue={defaults.exclusiveArea} error={fieldErrors.exclusiveArea} />
        <Field label="方角(任意)" name="direction" defaultValue={defaults.direction} placeholder="例: 南" />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold text-neutral-800">賃料・費用</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="賃料(円)" name="rent" type="number" required defaultValue={defaults.rent} error={fieldErrors.rent} />
          <Field label="管理費(円・任意)" name="managementFee" type="number" defaultValue={defaults.managementFee} />
          <Field label="共益費(円・任意)" name="commonServiceFee" type="number" defaultValue={defaults.commonServiceFee} />
          <Field label="敷金(円)" name="deposit" type="number" defaultValue={defaults.deposit} error={fieldErrors.deposit} />
          <Field label="礼金(円)" name="keyMoney" type="number" defaultValue={defaults.keyMoney} error={fieldErrors.keyMoney} />
          <Field label="保証金(円・任意)" name="guaranteeDeposit" type="number" defaultValue={defaults.guaranteeDeposit} />
          <Field label="償却(円・任意)" name="amortization" type="number" defaultValue={defaults.amortization} />
          <Field label="保証会社費用(円・任意)" name="guarantorCompanyFee" type="number" defaultValue={defaults.guarantorCompanyFee} />
          <Field label="火災保険料(円・任意)" name="fireInsuranceFee" type="number" defaultValue={defaults.fireInsuranceFee} />
          <Field label="鍵交換費用(円・任意)" name="keyExchangeFee" type="number" defaultValue={defaults.keyExchangeFee} />
          <Field label="クリーニング費用(円・任意)" name="cleaningFee" type="number" defaultValue={defaults.cleaningFee} />
          <Field label="更新料(円・任意)" name="renewalFee" type="number" defaultValue={defaults.renewalFee} />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800">その他費用</h2>
          <button
            type="button"
            onClick={() => setOtherCosts((c) => [...c, { name: "", amount: "0", taxType: "INCLUDED", isRequired: true }])}
            className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700"
          >
            + 費目を追加
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {otherCosts.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 p-3 sm:grid-cols-6">
              <input
                type="text"
                placeholder="費目名"
                value={c.name}
                onChange={(e) => setOtherCosts((prev) => prev.map((p, j) => (j === i ? { ...p, name: e.target.value } : p)))}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm sm:col-span-2"
              />
              <input
                type="number"
                placeholder="金額"
                value={c.amount}
                onChange={(e) => setOtherCosts((prev) => prev.map((p, j) => (j === i ? { ...p, amount: e.target.value } : p)))}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <select
                value={c.taxType}
                onChange={(e) => setOtherCosts((prev) => prev.map((p, j) => (j === i ? { ...p, taxType: e.target.value } : p)))}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              >
                {Object.entries(TAX_TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={c.isRequired}
                  onChange={(e) => setOtherCosts((prev) => prev.map((p, j) => (j === i ? { ...p, isRequired: e.target.checked } : p)))}
                />
                必須
              </label>
              <button
                type="button"
                onClick={() => setOtherCosts((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-md border border-red-300 px-2 py-1.5 text-xs font-semibold text-red-600"
              >
                削除
              </button>
            </div>
          ))}
          {otherCosts.length === 0 && <p className="text-sm text-neutral-400">その他費用はまだ登録されていません。</p>}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="契約期間(任意)" name="contractPeriod" defaultValue={defaults.contractPeriod} placeholder="例: 2年間" />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          契約形態(任意)
          <select name="contractType" defaultValue={defaults.contractType} className="rounded-md border border-neutral-300 px-3 py-2">
            <option value="">未選択</option>
            {Object.entries(CONTRACT_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <Field label="入居可能時期(任意)" name="availableDate" defaultValue={defaults.availableDate} placeholder="例: 即入居可" />
        <Field label="現況(任意)" name="currentStatus" defaultValue={defaults.currentStatus} placeholder="例: 空室" />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          取引態様(任意)
          <select name="transactionType" defaultValue={defaults.transactionType} className="rounded-md border border-neutral-300 px-3 py-2">
            <option value="">未選択</option>
            {Object.entries(TRANSACTION_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <Field label="特徴タグ(カンマ区切り・任意)" name="featureTags" defaultValue={defaults.featureTags} placeholder="例: 駅近,即入居可" />
      </section>

      <section className="grid grid-cols-1 gap-4">
        <TextAreaField label="募集条件(任意)" name="recruitingConditions" defaultValue={defaults.recruitingConditions} />
        <Field label="キャッチコピー(任意)" name="catchCopy" defaultValue={defaults.catchCopy} />
        <TextAreaField label="備考(任意)" name="remarks" defaultValue={defaults.remarks} />
        <TextAreaField label="特約(任意)" name="specialTerms" defaultValue={defaults.specialTerms} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold text-neutral-800">設備・条件</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {safeEquipmentOptions.map((eq) => (
            <label key={eq.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={equipmentIds.includes(eq.id)}
                onChange={(e) =>
                  setEquipmentIds((prev) => (e.target.checked ? [...prev, eq.id] : prev.filter((id) => id !== eq.id)))
                }
              />
              {eq.name}
            </label>
          ))}
        </div>
        {equipmentIds.map((id) => (
          <input key={id} type="hidden" name="equipmentIds" value={id} />
        ))}
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="tap-target self-start rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  defaultValue,
  error,
  type = "text",
  step,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  error?: string[];
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      {label}
      {required && <span className="ml-1 text-red-600">必須</span>}
      <input
        type={type}
        name={name}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="rounded-md border border-neutral-300 px-3 py-2"
      />
      {error && error.length > 0 && <span className="text-xs text-red-600">{error[0]}</span>}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={3} className="rounded-md border border-neutral-300 px-3 py-2" />
    </label>
  );
}
