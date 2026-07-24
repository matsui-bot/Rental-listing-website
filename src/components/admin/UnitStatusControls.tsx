"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  RECRUITING_STATUS,
  RECRUITING_STATUS_LABEL,
  PUBLICATION_STATUS_LABEL,
  type RecruitingStatus,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import {
  changeRecruitingStatus,
  setPublicationStatus,
  confirmUpdate,
  duplicateUnit,
  deleteUnit,
} from "@/app/admin/(protected)/units/actions";

export function UnitStatusControls({
  unitId,
  recruitingStatus,
  publicationStatus,
  publishedAt,
  lastUpdatedAt,
  nextUpdateDueAt,
}: {
  unitId: string;
  recruitingStatus: string;
  publicationStatus: string;
  publishedAt: Date | null;
  lastUpdatedAt: Date | null;
  nextUpdateDueAt: Date | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[] | null>(null);

  const isPublished = publicationStatus === "PUBLISHED";
  const isPubliclyVisible = isPublished && recruitingStatus === "RECRUITING";

  function run(fn: () => Promise<{ error?: string; missingFields?: string[] } | void>) {
    setError(null);
    setMissingFields(null);
    startTransition(async () => {
      const result = await fn();
      if (result && "error" in result && result.error) {
        setError(result.error);
        setMissingFields(result.missingFields ?? null);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isPubliclyVisible ? "bg-brand-100 text-brand-700" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {isPubliclyVisible ? "現在サイトに公開中" : "現在サイトには非表示"}
        </span>
        <span className="text-xs text-neutral-500">
          公開状態: {PUBLICATION_STATUS_LABEL[publicationStatus as keyof typeof PUBLICATION_STATUS_LABEL] ?? publicationStatus}
        </span>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          <p className="font-medium">{error}</p>
          {missingFields && missingFields.length > 0 && (
            <ul className="mt-1 list-inside list-disc">
              {missingFields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          募集状態
          <select
            defaultValue={recruitingStatus}
            disabled={isPending}
            onChange={(e) => run(() => changeRecruitingStatus(unitId, e.target.value as RecruitingStatus))}
            className="rounded-md border border-neutral-300 px-3 py-2"
          >
            {Object.values(RECRUITING_STATUS).map((s) => (
              <option key={s} value={s}>{RECRUITING_STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          公開操作
          <div className="flex gap-2">
            {!isPublished ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => setPublicationStatus(unitId, "PUBLISHED"))}
                className="tap-target rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                公開する
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => setPublicationStatus(unitId, "UNPUBLISHED"))}
                className="tap-target rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"
              >
                非公開にする
              </button>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(() => confirmUpdate(unitId))}
              className="tap-target rounded-md border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 disabled:opacity-60"
            >
              更新確認する
            </button>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-1 text-xs text-neutral-500 sm:grid-cols-3">
        <div>情報公開日: {formatDate(publishedAt)}</div>
        <div>最終更新日: {formatDate(lastUpdatedAt)}</div>
        <div>次回更新予定日: {formatDate(nextUpdateDueAt)}</div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
        <Link href={`/admin/units/${unitId}/preview`} target="_blank" className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold">
          公開前プレビュー
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => duplicateUnit(unitId))}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-semibold"
        >
          この住戸を複製
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm("この住戸を削除しますか?(削除後は公開サイトから即時非表示になります)")) return;
            run(() => deleteUnit(unitId));
          }}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600"
        >
          削除
        </button>
      </div>
    </div>
  );
}
