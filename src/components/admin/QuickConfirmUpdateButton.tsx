"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmUpdate } from "@/app/admin/(protected)/units/actions";

export function QuickConfirmUpdateButton({ unitId }: { unitId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await confirmUpdate(unitId);
            if (result.error) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="rounded-md border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-700 disabled:opacity-60"
      >
        {isPending ? "処理中..." : "更新確認する"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
