import "server-only";
import { cookies } from "next/headers";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_DURATION_SECONDS,
  type AdminSessionPayload,
} from "./session-token";

export type { AdminSessionPayload };
const SESSION_COOKIE_NAME = "te_admin_session";

export async function setSessionCookie(payload: AdminSessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** 現在の管理者セッションを取得する(未ログインの場合は null) */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** ログイン必須ページ用のガード。未ログインなら null を返す(呼び出し側で redirect する) */
export async function requireAdminSession(): Promise<AdminSessionPayload | null> {
  return getAdminSession();
}
