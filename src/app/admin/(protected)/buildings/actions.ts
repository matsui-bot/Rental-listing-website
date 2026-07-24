"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildingSchema } from "@/lib/validation/building";
import { getAdminSession } from "@/lib/auth-session";

export interface BuildingActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseBuildingFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  let stations: unknown = [];
  try {
    stations = JSON.parse(String(formData.get("stationsJson") || "[]"));
  } catch {
    stations = [];
  }
  return buildingSchema.safeParse({ ...raw, stations });
}

export async function createBuilding(
  _prevState: BuildingActionState,
  formData: FormData,
): Promise<BuildingActionState> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "認証が必要です。再度ログインしてください。" };

  const parsed = parseBuildingFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: "入力内容をご確認ください。", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { stations, ...data } = parsed.data;

  const building = await prisma.building.create({
    data: {
      ...data,
      totalUnits: data.totalUnits ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      stations: { create: stations.map((s, i) => ({ ...s, order: i })) },
    },
  });

  revalidatePath("/admin/buildings");
  redirect(`/admin/buildings/${building.id}`);
}

export async function updateBuilding(
  buildingId: string,
  _prevState: BuildingActionState,
  formData: FormData,
): Promise<BuildingActionState> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "認証が必要です。再度ログインしてください。" };

  const parsed = parseBuildingFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: "入力内容をご確認ください。", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { stations, ...data } = parsed.data;

  await prisma.$transaction([
    prisma.buildingStation.deleteMany({ where: { buildingId } }),
    prisma.building.update({
      where: { id: buildingId },
      data: {
        ...data,
        totalUnits: data.totalUnits ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        stations: { create: stations.map((s, i) => ({ ...s, order: i })) },
      },
    }),
  ]);

  revalidatePath("/admin/buildings");
  revalidatePath(`/admin/buildings/${buildingId}`);
  return { status: "idle", message: "保存しました。" };
}

export async function deleteBuilding(buildingId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const unitCount = await prisma.unit.count({ where: { buildingId, isDeleted: false } });
  if (unitCount > 0) {
    return { error: "この建物には募集住戸が登録されているため削除できません。先に住戸を削除してください。" };
  }

  await prisma.building.update({ where: { id: buildingId }, data: { isDeleted: true } });
  revalidatePath("/admin/buildings");
  redirect("/admin/buildings");
}
