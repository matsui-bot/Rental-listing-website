import bcrypt from "bcryptjs";

/**
 * パスワードのハッシュ化/検証のみを扱うモジュール。
 * seed スクリプト(Next.jsランタイム外)からも読み込めるよう、
 * next/headers 等 Next.js 依存を持つセッション処理(auth-session.ts)とは分離している。
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 12);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}
