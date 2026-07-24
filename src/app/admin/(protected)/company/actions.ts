"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { companyInfoSchema } from "@/lib/validation/company";
import { getAdminSession } from "@/lib/auth-session";

export interface CompanyActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateCompanyInfo(
  _prevState: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "認証が必要です。再度ログインしてください。" };

  const parsed = companyInfoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "error",
      message: "入力内容をご確認ください。",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.companyInfo.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/company");
  return { status: "idle", message: "会社情報を更新しました。" };
}
