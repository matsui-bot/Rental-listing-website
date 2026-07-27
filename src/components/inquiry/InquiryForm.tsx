"use client";

import { useActionState, useId, useState } from "react";
import { submitInquiry, type InquiryActionState } from "@/app/(public)/contact/actions";

export interface InquiryFormContext {
  unitId?: string;
  buildingName?: string;
  roomNumber?: string;
}

const initialState: InquiryActionState = { status: "idle" };

export function InquiryForm({ context }: { context?: InquiryFormContext }) {
  const [state, formAction, isPending] = useActionState(submitInquiry, initialState);
  const [renderedAt] = useState(() => Date.now());
  const formId = useId();

  const fieldErrors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-brand-300 bg-brand-50 p-6 text-center"
      >
        <p className="text-lg font-bold text-brand-700">送信が完了しました</p>
        <p className="mt-2 text-sm text-neutral-700">
          お問い合わせいただきありがとうございます。担当者より折り返しご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" aria-describedby={`${formId}-notice`}>
      {context?.unitId && <input type="hidden" name="unitId" value={context.unitId} />}
      <input type="hidden" name="sourceUrl" value={typeof window !== "undefined" ? window.location.href : ""} />
      <input type="hidden" name="formRenderedAt" value={renderedAt} />
      {/* ハニーポット: 人間には見えないフィールド。ボットが入力すると送信が拒否される */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <label htmlFor={`${formId}-website`}>ウェブサイト</label>
        <input id={`${formId}-website`} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {context?.buildingName && (
        <p className="rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          対象物件: {context.buildingName} {context.roomNumber}
        </p>
      )}

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

      <FormField label="氏名" htmlFor={`${formId}-name`} required error={fieldErrors.name}>
        <input
          id={`${formId}-name`}
          name="name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="電話番号" htmlFor={`${formId}-phone`} error={fieldErrors.phone}>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            maxLength={20}
            autoComplete="tel"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="メールアドレス" htmlFor={`${formId}-email`} error={fieldErrors.email}>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            maxLength={200}
            autoComplete="email"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </FormField>
      </div>
      <p className="-mt-3 text-xs text-neutral-500">電話番号・メールアドレスのいずれかは必須です</p>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-neutral-700">
          希望する連絡方法<span className="ml-1 text-red-600">必須</span>
        </legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" name="preferredContactMethod" value="PHONE" defaultChecked required />
            電話
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="preferredContactMethod" value="EMAIL" />
            メール
          </label>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="内見希望日(任意)" htmlFor={`${formId}-viewing`}>
          <input
            id={`${formId}-viewing`}
            name="preferredViewingDate"
            type="text"
            placeholder="例: 8月上旬の週末"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </FormField>
        <FormField label="入居希望時期(任意)" htmlFor={`${formId}-movein`}>
          <input
            id={`${formId}-movein`}
            name="desiredMoveInTime"
            type="text"
            placeholder="例: 2026年9月上旬"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </FormField>
      </div>

      <FormField label="質問・要望(任意)" htmlFor={`${formId}-message`}>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          maxLength={2000}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </FormField>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="agreeToPolicy" value="true" required className="mt-1" />
          <span>
            <a href="/privacy" target="_blank" className="text-brand-700 underline">
              個人情報の取り扱い
            </a>
            に同意する<span className="ml-1 text-red-600">必須</span>
          </span>
        </label>
        {fieldErrors.agreeToPolicy && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {fieldErrors.agreeToPolicy[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="tap-target rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "送信中..." : "この内容で送信する"}
      </button>
      <p id={`${formId}-notice`} className="text-xs text-neutral-400">
        送信ボタンは二重送信防止のため送信中は押せなくなります。
      </p>
    </form>
  );
}

function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
      <span>
        {label}
        {required && <span className="ml-1 text-red-600">必須</span>}
      </span>
      {children}
      {error && error.length > 0 && (
        <span role="alert" className="text-xs font-normal text-red-600">
          {error[0]}
        </span>
      )}
    </label>
  );
}
