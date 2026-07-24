"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { unitSchema } from "@/lib/validation/unit";
import { getAdminSession } from "@/lib/auth-session";
import { checkUnitPublishReadiness } from "@/lib/data/publish-check";
import { calcNextUpdateDueDate } from "@/lib/update-schedule";
import {
  RECRUITING_STATUS,
  type RecruitingStatus,
} from "@/lib/constants";

export interface UnitActionState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseUnitFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  let otherCosts: unknown = [];
  try {
    otherCosts = JSON.parse(String(formData.get("otherCostsJson") || "[]"));
  } catch {
    otherCosts = [];
  }
  const equipmentIds = formData.getAll("equipmentIds").map(String);
  return unitSchema.safeParse({ ...raw, otherCosts, equipmentIds });
}

function revalidateUnitPaths(unitId: string, buildingId: string) {
  revalidatePath("/admin/units");
  revalidatePath(`/admin/units/${unitId}`);
  revalidatePath(`/admin/buildings/${buildingId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/updates");
  revalidatePath("/properties");
  revalidatePath(`/properties/${unitId}`);
  revalidatePath("/");
}

export async function createUnit(
  _prevState: UnitActionState,
  formData: FormData,
): Promise<UnitActionState> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "認証が必要です。再度ログインしてください。" };

  const parsed = parseUnitFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: "入力内容をご確認ください。", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { otherCosts, equipmentIds, buildingId, ...data } = parsed.data;

  const existing = await prisma.unit.findUnique({ where: { managementNumber: data.managementNumber } });
  if (existing) {
    return {
      status: "error",
      message: "この管理番号は既に使用されています。",
      fieldErrors: { managementNumber: ["この管理番号は既に使用されています"] },
    };
  }

  const unit = await prisma.unit.create({
    data: {
      ...data,
      buildingId,
      otherCosts: { create: otherCosts.map((c, i) => ({ ...c, order: i })) },
      equipment: { create: equipmentIds.map((equipmentId) => ({ equipmentId })) },
    },
  });

  revalidateUnitPaths(unit.id, buildingId);
  redirect(`/admin/units/${unit.id}`);
}

export async function updateUnit(
  unitId: string,
  _prevState: UnitActionState,
  formData: FormData,
): Promise<UnitActionState> {
  const session = await getAdminSession();
  if (!session) return { status: "error", message: "認証が必要です。再度ログインしてください。" };

  const parsed = parseUnitFormData(formData);
  if (!parsed.success) {
    return { status: "error", message: "入力内容をご確認ください。", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { otherCosts, equipmentIds, buildingId, ...data } = parsed.data;

  const duplicate = await prisma.unit.findFirst({
    where: { managementNumber: data.managementNumber, NOT: { id: unitId } },
  });
  if (duplicate) {
    return {
      status: "error",
      message: "この管理番号は既に使用されています。",
      fieldErrors: { managementNumber: ["この管理番号は既に使用されています"] },
    };
  }

  await prisma.$transaction([
    prisma.otherCost.deleteMany({ where: { unitId } }),
    prisma.unitEquipment.deleteMany({ where: { unitId } }),
    prisma.unit.update({
      where: { id: unitId },
      data: {
        ...data,
        buildingId,
        otherCosts: { create: otherCosts.map((c, i) => ({ ...c, order: i })) },
        equipment: { create: equipmentIds.map((equipmentId) => ({ equipmentId })) },
      },
    }),
  ]);

  revalidateUnitPaths(unitId, buildingId);
  return { status: "idle", message: "保存しました。" };
}

export async function deleteUnit(unitId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const unit = await prisma.unit.update({ where: { id: unitId }, data: { isDeleted: true, publicationStatus: "UNPUBLISHED" } });
  revalidateUnitPaths(unitId, unit.buildingId);
  redirect("/admin/units");
}

/**
 * 住戸の複製。間取り・面積・設備・契約条件・写真・備考は引き継ぎ、
 * 部屋番号・賃料・管理費・入居可能日・募集状態・公開日・更新日は
 * 複製後に必ず確認してもらうため下書き状態でリセットする(要件定義書 セクション9)。
 */
export async function duplicateUnit(unitId: string): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const original = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { otherCosts: true, photos: true, equipment: true },
  });
  if (!original) return { error: "複製元の住戸が見つかりません。" };

  const copy = await prisma.unit.create({
    data: {
      buildingId: original.buildingId,
      managementNumber: `${original.managementNumber}-COPY-${Date.now().toString(36)}`,
      roomNumber: "要確認",
      floor: original.floor,
      layoutType: original.layoutType,
      exclusiveArea: original.exclusiveArea,
      direction: original.direction,
      rent: original.rent,
      managementFee: original.managementFee,
      commonServiceFee: original.commonServiceFee,
      deposit: original.deposit,
      keyMoney: original.keyMoney,
      guaranteeDeposit: original.guaranteeDeposit,
      amortization: original.amortization,
      guarantorCompanyFee: original.guarantorCompanyFee,
      fireInsuranceFee: original.fireInsuranceFee,
      keyExchangeFee: original.keyExchangeFee,
      cleaningFee: original.cleaningFee,
      renewalFee: original.renewalFee,
      contractPeriod: original.contractPeriod,
      contractType: original.contractType,
      availableDate: null,
      currentStatus: original.currentStatus,
      recruitingConditions: original.recruitingConditions,
      catchCopy: original.catchCopy,
      remarks: original.remarks,
      specialTerms: original.specialTerms,
      transactionType: original.transactionType,
      featureTags: original.featureTags,
      recruitingStatus: RECRUITING_STATUS.DRAFT,
      publicationStatus: "UNPUBLISHED",
      publishedAt: null,
      lastUpdatedAt: null,
      nextUpdateDueAt: null,
      otherCosts: {
        create: original.otherCosts.map((c) => ({
          name: c.name,
          amount: c.amount,
          taxType: c.taxType,
          isRequired: c.isRequired,
          remarks: c.remarks,
          order: c.order,
        })),
      },
      equipment: { create: original.equipment.map((e) => ({ equipmentId: e.equipmentId })) },
      photos: {
        create: original.photos.map((p) => ({
          targetType: "UNIT",
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
          category: p.category,
          caption: p.caption,
          altText: p.altText,
          order: p.order,
          isMain: p.isMain,
        })),
      },
    },
  });

  revalidateUnitPaths(copy.id, original.buildingId);
  redirect(`/admin/units/${copy.id}`);
}

export async function changeRecruitingStatus(
  unitId: string,
  status: RecruitingStatus,
): Promise<{ error?: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const unit = await prisma.unit.update({ where: { id: unitId }, data: { recruitingStatus: status } });
  revalidateUnitPaths(unitId, unit.buildingId);
  return {};
}

export async function setPublicationStatus(
  unitId: string,
  status: "PUBLISHED" | "UNPUBLISHED",
): Promise<{ error?: string; missingFields?: string[] }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) return { error: "住戸が見つかりません。" };

  if (status === "UNPUBLISHED") {
    await prisma.unit.update({ where: { id: unitId }, data: { publicationStatus: "UNPUBLISHED" } });
    revalidateUnitPaths(unitId, unit.buildingId);
    return {};
  }

  const missingFields = await checkUnitPublishReadiness(unitId);
  if (missingFields.length > 0) {
    return { error: "公開に必要な項目が不足しています。", missingFields };
  }

  const company = await prisma.companyInfo.findUnique({ where: { id: "singleton" } });
  const intervalDays = company?.updateIntervalDays ?? 14;
  const now = new Date();

  await prisma.unit.update({
    where: { id: unitId },
    data: {
      publicationStatus: "PUBLISHED",
      publishedAt: unit.publishedAt ?? now,
      lastUpdatedAt: now,
      nextUpdateDueAt: calcNextUpdateDueDate(now, intervalDays),
    },
  });

  revalidateUnitPaths(unitId, unit.buildingId);
  return {};
}

/** 「更新確認」: 情報を確認したとみなし、最終更新日・次回更新予定日を再設定する */
export async function confirmUpdate(unitId: string): Promise<{ error?: string; missingFields?: string[] }> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const missingFields = await checkUnitPublishReadiness(unitId);
  if (missingFields.length > 0) {
    return { error: "公開に必要な項目が不足しているため更新確認できません。", missingFields };
  }

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) return { error: "住戸が見つかりません。" };

  const company = await prisma.companyInfo.findUnique({ where: { id: "singleton" } });
  const intervalDays = company?.updateIntervalDays ?? 14;
  const now = new Date();

  await prisma.unit.update({
    where: { id: unitId },
    data: {
      publicationStatus: "PUBLISHED",
      publishedAt: unit.publishedAt ?? now,
      lastUpdatedAt: now,
      nextUpdateDueAt: calcNextUpdateDueDate(now, intervalDays),
      recruitingStatus: unit.recruitingStatus === "UPDATE_PENDING" ? "RECRUITING" : unit.recruitingStatus,
    },
  });

  revalidateUnitPaths(unitId, unit.buildingId);
  return {};
}
