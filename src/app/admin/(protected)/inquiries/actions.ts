"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth-session";
import { INQUIRY_STATUS, type InquiryStatus } from "@/lib/constants";

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };
  if (!Object.values(INQUIRY_STATUS).includes(status)) return { error: "不正な対応状況です。" };

  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status } });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath("/admin");
  return {};
}

export async function updateInquiryMemo(
  inquiryId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const memo = String(formData.get("adminMemo") ?? "").slice(0, 2000);
  await prisma.inquiry.update({ where: { id: inquiryId }, data: { adminMemo: memo || null } });
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return {};
}
