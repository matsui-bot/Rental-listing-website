import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-password";

/**
 * 一時的な初期セットアップ用エンドポイント。
 * 本番の初回管理者アカウントを作成するためだけに使用し、使用後は削除すること。
 * SETUP_TOKEN 環境変数と一致するトークンを知っている場合のみ動作する。
 */
const bodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  name: z.string().trim().min(1).max(50).default("管理担当者"),
});

export async function POST(request: Request) {
  const setupToken = process.env.SETUP_TOKEN;
  if (!setupToken) {
    return NextResponse.json({ error: "SETUP_TOKEN is not configured" }, { status: 404 });
  }

  const providedToken = request.headers.get("x-setup-token");
  if (providedToken !== setupToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await hashPassword(password);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  return NextResponse.json({ ok: true, email: admin.email });
}
