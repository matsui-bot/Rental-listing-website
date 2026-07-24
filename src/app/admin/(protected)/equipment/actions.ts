"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { equipmentMasterSchema } from "@/lib/validation/company";
import { getAdminSession } from "@/lib/auth-session";

export interface EquipmentActionState {
  status: "idle" | "error";
  message?: string;
}

export async function createEquipment(
  _prevState: EquipmentActionState,
  formData: FormData,
): Promise<EquipmentActionState> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "認証が必要です。" };

  const count = await prisma.equipmentMaster.count();
  const parsed = equipmentMasterSchema.safeParse({
    name: formData.get("name"),
    scope: formData.get("scope"),
    order: count,
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "入力内容をご確認ください。" };
  }

  const existing = await prisma.equipmentMaster.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return { status: "error", message: "同じ名前の設備が既に登録されています。" };
  }

  await prisma.equipmentMaster.create({ data: parsed.data });
  revalidatePath("/admin/equipment");
  return { status: "idle", message: "追加しました。" };
}

export async function deleteEquipment(equipmentId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  await prisma.equipmentMaster.delete({ where: { id: equipmentId } });
  revalidatePath("/admin/equipment");
  return {};
}
