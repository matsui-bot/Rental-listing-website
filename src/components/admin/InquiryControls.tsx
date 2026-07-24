"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { INQUIRY_STATUS, INQUIRY_STATUS_LABEL, type InquiryStatus } from "@/lib/constants";
import { updateInquiryStatus, updateInquiryMemo } from "@/app/admin/(protected)/inquiries/actions";

export function InquiryControls({
  inquiryId,
  status,
  adminMemo,
}: {
  inquiryId: string;
  status: string;
  adminMemo: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        対応状況
        <select
          defaultValue={status}
          disabled={isPending}
          onChange={(e) => {
            setError(null);
            startTransition(async () => {
              const result = await updateInquiryStatus(inquiryId, e.target.value as InquiryStatus);
              if (result.error) setError(result.error);
              router.refresh();
            });
          }}
          className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-2"
        >
          {Object.values(INQUIRY_STATUS).map((s) => (
            <option key={s} value={s}>{INQUIRY_STATUS_LABEL[s]}</option>
          ))}
        </select>
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <form
        action={(formData) => {
          startTransition(async () => {
            await updateInquiryMemo(inquiryId, formData);
            router.refresh();
          });
        }}
        className="mt-4 flex flex-col gap-2"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          管理メモ(社内共有用・応募者には表示されません)
          <textarea
            name="adminMemo"
            defaultValue={adminMemo ?? ""}
            rows={4}
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="tap-target self-start rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "保存中..." : "メモを保存"}
        </button>
      </form>
    </div>
  );
}
