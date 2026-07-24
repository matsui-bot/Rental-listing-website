"use client";

import { useActionState } from "react";
import { login, type LoginActionState } from "./actions";

const initialState: LoginActionState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        メールアドレス
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
        パスワード
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="tap-target rounded-md bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
