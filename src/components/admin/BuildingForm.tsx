"use client";

import { useActionState, useState } from "react";
import { PREFECTURES } from "@/lib/constants";
import type { BuildingActionState } from "@/app/admin/(protected)/buildings/actions";

export interface BuildingFormStation {
  id?: string;
  lineName: string;
  stationName: string;
  walkMinutes?: number | null;
  busMinutes?: number | null;
  note?: string;
}

export interface BuildingFormDefaults {
  name: string;
  nameKana: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  addressLine2: string;
  latitude: string;
  longitude: string;
  addressDisclosureLevel: string;
  structure: string;
  totalFloors: string;
  totalUnits: string;
  builtYearMonth: string;
  busInfo: string;
  parkingInfo: string;
  surroundingInfo: string;
  commonFacilitiesNote: string;
  stations: BuildingFormStation[];
}

export const emptyBuildingFormDefaults: BuildingFormDefaults = {
  name: "",
  nameKana: "",
  postalCode: "",
  prefecture: "東京都",
  city: "",
  addressLine: "",
  addressLine2: "",
  latitude: "",
  longitude: "",
  addressDisclosureLevel: "FULL",
  structure: "",
  totalFloors: "",
  totalUnits: "",
  builtYearMonth: "",
  busInfo: "",
  parkingInfo: "",
  surroundingInfo: "",
  commonFacilitiesNote: "",
  stations: [],
};

export function BuildingForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: BuildingActionState, formData: FormData) => Promise<BuildingActionState>;
  defaults: BuildingFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, { status: "idle" } as BuildingActionState);
  const [stations, setStations] = useState<BuildingFormStation[]>(defaults.stations);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="stationsJson" value={JSON.stringify(stations)} />

      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="建物名" name="name" required defaultValue={defaults.name} error={fieldErrors.name} />
        <Field label="建物名カナ" name="nameKana" defaultValue={defaults.nameKana} />
        <Field label="郵便番号" name="postalCode" required defaultValue={defaults.postalCode} error={fieldErrors.postalCode} />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          都道府県<span className="ml-1 text-red-600">必須</span>
          <select name="prefecture" defaultValue={defaults.prefecture} className="rounded-md border border-neutral-300 px-3 py-2">
            {PREFECTURES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <Field label="市区町村" name="city" required defaultValue={defaults.city} error={fieldErrors.city} />
        <Field label="町名番地" name="addressLine" required defaultValue={defaults.addressLine} error={fieldErrors.addressLine} />
        <Field label="建物名以降住所(任意)" name="addressLine2" defaultValue={defaults.addressLine2} />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          住所の公開範囲
          <select name="addressDisclosureLevel" defaultValue={defaults.addressDisclosureLevel} className="rounded-md border border-neutral-300 px-3 py-2">
            <option value="FULL">番地まで公開</option>
            <option value="CITY_ONLY">市区町村までのみ公開</option>
          </select>
        </label>
        <Field label="緯度(任意)" name="latitude" type="number" step="any" defaultValue={defaults.latitude} />
        <Field label="経度(任意)" name="longitude" type="number" step="any" defaultValue={defaults.longitude} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="構造" name="structure" required defaultValue={defaults.structure} error={fieldErrors.structure} placeholder="例: 鉄筋コンクリート造" />
        <Field label="総階数" name="totalFloors" type="number" required defaultValue={defaults.totalFloors} error={fieldErrors.totalFloors} />
        <Field label="総戸数(任意)" name="totalUnits" type="number" defaultValue={defaults.totalUnits} />
        <Field
          label="築年月"
          name="builtYearMonth"
          required
          defaultValue={defaults.builtYearMonth}
          error={fieldErrors.builtYearMonth}
          placeholder="例: 2015-04"
        />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800">交通情報</h2>
          <button
            type="button"
            onClick={() => setStations((s) => [...s, { lineName: "", stationName: "", walkMinutes: null }])}
            className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-semibold text-brand-700"
          >
            + 路線を追加
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {stations.map((s, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 rounded-md border border-neutral-200 p-3 sm:grid-cols-5">
              <input
                type="text"
                placeholder="路線名"
                value={s.lineName}
                onChange={(e) => setStations((prev) => prev.map((p, j) => (j === i ? { ...p, lineName: e.target.value } : p)))}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="駅名"
                value={s.stationName}
                onChange={(e) => setStations((prev) => prev.map((p, j) => (j === i ? { ...p, stationName: e.target.value } : p)))}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="徒歩(分)"
                value={s.walkMinutes ?? ""}
                onChange={(e) =>
                  setStations((prev) => prev.map((p, j) => (j === i ? { ...p, walkMinutes: e.target.value ? Number(e.target.value) : null } : p)))
                }
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="バス(分・任意)"
                value={s.busMinutes ?? ""}
                onChange={(e) =>
                  setStations((prev) => prev.map((p, j) => (j === i ? { ...p, busMinutes: e.target.value ? Number(e.target.value) : null } : p)))
                }
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => setStations((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-md border border-red-300 px-2 py-1.5 text-xs font-semibold text-red-600"
              >
                削除
              </button>
            </div>
          ))}
          {stations.length === 0 && <p className="text-sm text-neutral-400">交通情報が未登録です。「+ 路線を追加」から登録してください。</p>}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="バス情報(任意)" name="busInfo" defaultValue={defaults.busInfo} />
        <Field label="駐車場情報(任意)" name="parkingInfo" defaultValue={defaults.parkingInfo} />
        <TextAreaField label="周辺情報(任意)" name="surroundingInfo" defaultValue={defaults.surroundingInfo} className="sm:col-span-2" />
        <TextAreaField label="共用設備(任意)" name="commonFacilitiesNote" defaultValue={defaults.commonFacilitiesNote} className="sm:col-span-2" />
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
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium text-neutral-700 ${className ?? ""}`}>
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={3} className="rounded-md border border-neutral-300 px-3 py-2" />
    </label>
  );
}
