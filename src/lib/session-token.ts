import { SignJWT, jwtVerify } from "jose";

const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8時間

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET が設定されていないか短すぎます。.env で十分な長さのランダム文字列を設定してください。",
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  name: string;
}

export async function createSessionToken(payload: AdminSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.adminId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string"
    ) {
      return { adminId: payload.adminId, email: payload.email, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}

export { SESSION_DURATION_SECONDS };
