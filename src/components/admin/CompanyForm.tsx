"use client";

import { useActionState } from "react";
import { updateCompanyInfo, type CompanyActionState } from "@/app/admin/(protected)/company/actions";
import { OVERDUE_ACTION_LABEL } from "@/lib/constants";
import type { CompanyInfoData } from "@/lib/data/company";

export function CompanyForm({ company }: { company: CompanyInfoData }) {
  const [state, formAction, isPending] = useActionState(updateCompanyInfo, { status: "idle" } as CompanyActionState);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.message}</p>
      )}
      {state.status === "idle" && state.message && (
        <p role="status" className="rounded-md bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">{state.message}</p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="会社名" name="name" required defaultValue={company.name} error={fieldErrors.name} />
        <Field label="ロゴ表示テキスト" name="logoText" required defaultValue={company.logoText} />
        <Field label="郵便番号" name="postalCode" required defaultValue={company.postalCode} error={fieldErrors.postalCode} />
        <Field label="都道府県" name="prefecture" required defaultValue={company.prefecture} />
        <Field label="市区町村" name="city" required defaultValue={company.city} />
        <Field label="番地以降住所" name="addressLine" required defaultValue={company.addressLine} />
        <Field label="電話番号" name="phone" required defaultValue={company.phone} error={fieldErrors.phone} />
        <Field label="営業時間" name="businessHours" required defaultValue={company.businessHours} />
        <Field label="定休日" name="closedDays" required defaultValue={company.closedDays} />
        <Field label="宅建業免許番号" name="licenseNumber" required defaultValue={company.licenseNumber} />
        <Field label="所属団体(任意)" name="associations" defaultValue={company.associations} />
      </section>

      <section className="grid grid-cols-1 gap-4">
        <Field label="トップページ メインコピー" name="topCatchCopy" defaultValue={company.topCatchCopy} />
        <Field label="トップページ サブコピー" name="topSubCopy" defaultValue={company.topSubCopy} />
        <TextArea label="会社案内 本文" name="companyIntro" defaultValue={company.companyIntro} rows={5} />
        <TextArea label="プライバシーポリシー本文" name="privacyPolicyBody" defaultValue={company.privacyPolicyBody} rows={8} />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="次回更新予定日の既定日数(日)"
          name="updateIntervalDays"
          type="number"
          required
          defaultValue={String(company.updateIntervalDays)}
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          更新期限超過時の動作
          <select name="overdueAction" defaultValue={company.overdueAction} className="rounded-md border border-neutral-300 px-3 py-2">
            {Object.entries(OVERDUE_ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="tap-target self-start rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "保存中..." : "保存する"}
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
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  error?: string[];
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      {label}
      {required && <span className="ml-1 text-red-600">必須</span>}
      <input type={type} name={name} defaultValue={defaultValue} className="rounded-md border border-neutral-300 px-3 py-2" />
      {error && error.length > 0 && <span className="text-xs text-red-600">{error[0]}</span>}
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      {label}
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="rounded-md border border-neutral-300 px-3 py-2" />
    </label>
  );
}
