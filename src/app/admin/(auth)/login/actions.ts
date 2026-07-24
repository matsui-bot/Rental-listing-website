"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/company";
import { verifyPassword } from "@/lib/auth-password";
import { setSessionCookie } from "@/lib/auth-session";
import { isRateLimited } from "@/lib/rate-limit";

export interface LoginActionState {
  status: "idle" | "error";
  message?: string;
}

export async function login(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { status: "error", message: "メールアドレスとパスワードを入力してください。" };
  }
  const { email, password } = parsed.data;

  if (isRateLimited(`login:${email}`)) {
    return { status: "error", message: "試行回数が多すぎます。しばらく時間をおいてから再度お試しください。" };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return { status: "error", message: "メールアドレスまたはパスワードが正しくありません。" };
  }
  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { status: "error", message: "メールアドレスまたはパスワードが正しくありません。" };
  }

  await setSessionCookie({ adminId: admin.id, email: admin.email, name: admin.name });
  redirect("/admin");
}
