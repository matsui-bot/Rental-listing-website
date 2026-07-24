"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LAYOUT_TYPES, PREFECTURES, RENT_UPPER_LIMIT_OPTIONS } from "@/lib/constants";

export interface PropertySearchValues {
  area?: string;
  maxRent?: string;
  layoutType?: string;
  keyword?: string;
  sort?: string;
}

export function PropertySearchForm({
  initial,
  showSort = false,
}: {
  initial: PropertySearchValues;
  showSort?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PropertySearchValues>(initial);

  function submit(next: PropertySearchValues) {
    const params = new URLSearchParams();
    if (next.area) params.set("area", next.area);
    if (next.maxRent) params.set("maxRent", next.maxRent);
    if (next.layoutType) params.set("layoutType", next.layoutType);
    if (next.keyword) params.set("keyword", next.keyword);
    if (next.sort) params.set("sort", next.sort);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(values);
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        エリア
        <select
          className="rounded-md border border-neutral-300 px-3 py-2"
          value={values.area ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, area: e.target.value }))}
        >
          <option value="">指定なし</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        賃料上限
        <select
          className="rounded-md border border-neutral-300 px-3 py-2"
          value={values.maxRent ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, maxRent: e.target.value }))}
        >
          <option value="">指定なし</option>
          {RENT_UPPER_LIMIT_OPTIONS.map((rent) => (
            <option key={rent} value={rent}>
              {Math.round(rent / 10000)}万円以下
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        間取り
        <select
          className="rounded-md border border-neutral-300 px-3 py-2"
          value={values.layoutType ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, layoutType: e.target.value }))}
        >
          <option value="">指定なし</option>
          {LAYOUT_TYPES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700 sm:col-span-2 lg:col-span-1">
        キーワード
        <input
          type="text"
          placeholder="駅名・特徴など"
          className="rounded-md border border-neutral-300 px-3 py-2"
          value={values.keyword ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, keyword: e.target.value }))}
        />
      </label>

      {showSort && (
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          並び替え
          <select
            className="rounded-md border border-neutral-300 px-3 py-2"
            value={values.sort ?? "newest"}
            onChange={(e) => {
              const next = { ...values, sort: e.target.value };
              setValues(next);
              submit(next);
            }}
          >
            <option value="newest">新着順</option>
            <option value="rent_asc">賃料が安い順</option>
            <option value="rent_desc">賃料が高い順</option>
          </select>
        </label>
      )}

      <button
        type="submit"
        className="tap-target rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 sm:col-span-2 lg:col-span-1"
      >
        この条件で探す
      </button>
    </form>
  );
}
