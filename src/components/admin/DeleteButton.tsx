"use client";

import { useState, useTransition } from "react";

export function DeleteButton({
  action,
  confirmMessage,
  label = "削除",
}: {
  action: () => Promise<{ error?: string } | void>;
  confirmMessage: string;
  label?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            const result = await action();
            if (result && "error" in result && result.error) {
              setError(result.error);
            }
          });
        }}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "処理中..." : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
