"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth-session";
import { getStorageProvider } from "@/lib/storage";
import {
  photoUploadMetaSchema,
  photoMetaUpdateSchema,
  MAX_UPLOAD_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/validation/photo";

function revalidateTarget(targetType: string, targetId: string) {
  if (targetType === "BUILDING") {
    revalidatePath(`/admin/buildings/${targetId}`);
  } else {
    revalidatePath(`/admin/units/${targetId}`);
  }
}

export interface PhotoActionResult {
  error?: string;
}

export async function uploadPhotos(formData: FormData): Promise<PhotoActionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const parsedMeta = photoUploadMetaSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    category: formData.get("category"),
  });
  if (!parsedMeta.success) return { error: "アップロード情報が不正です。" };
  const { targetType, targetId, category } = parsedMeta.data;

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "画像ファイルを選択してください。" };

  for (const file of files) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      return { error: `対応していないファイル形式です(${file.name})。JPEG/PNG/WebPのみアップロードできます。` };
    }
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      return { error: `ファイルサイズが大きすぎます(${file.name})。8MB以下にしてください。` };
    }
  }

  const existingCount = await prisma.photo.count({
    where: targetType === "BUILDING" ? { buildingId: targetId } : { unitId: targetId },
  });
  const existingMain = await prisma.photo.findFirst({
    where: targetType === "BUILDING" ? { buildingId: targetId, isMain: true } : { unitId: targetId, isMain: true },
  });

  const storage = getStorageProvider();
  let order = existingCount;
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await storage.saveImage(buffer, file.name);
    await prisma.photo.create({
      data: {
        targetType,
        buildingId: targetType === "BUILDING" ? targetId : null,
        unitId: targetType === "UNIT" ? targetId : null,
        url: saved.url,
        thumbnailUrl: saved.thumbnailUrl,
        category,
        order: order++,
        isMain: !existingMain && order === existingCount + 1,
      },
    });
  }

  revalidateTarget(targetType, targetId);
  return {};
}

export async function deletePhoto(
  photoId: string,
  targetType: string,
  targetId: string,
): Promise<PhotoActionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return {};

  const storage = getStorageProvider();
  await storage.deleteImage(photo.url).catch(() => undefined);
  if (photo.thumbnailUrl) await storage.deleteImage(photo.thumbnailUrl).catch(() => undefined);
  await prisma.photo.delete({ where: { id: photoId } });

  if (photo.isMain) {
    const next = await prisma.photo.findFirst({
      where: targetType === "BUILDING" ? { buildingId: targetId } : { unitId: targetId },
      orderBy: { order: "asc" },
    });
    if (next) await prisma.photo.update({ where: { id: next.id }, data: { isMain: true } });
  }

  revalidateTarget(targetType, targetId);
  return {};
}

export async function setMainPhoto(
  photoId: string,
  targetType: string,
  targetId: string,
): Promise<PhotoActionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  await prisma.$transaction([
    prisma.photo.updateMany({
      where: targetType === "BUILDING" ? { buildingId: targetId } : { unitId: targetId },
      data: { isMain: false },
    }),
    prisma.photo.update({ where: { id: photoId }, data: { isMain: true } }),
  ]);

  revalidateTarget(targetType, targetId);
  return {};
}

export async function reorderPhotos(
  targetType: string,
  targetId: string,
  orderedIds: string[],
): Promise<PhotoActionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.photo.update({ where: { id }, data: { order: index } })),
  );

  revalidateTarget(targetType, targetId);
  return {};
}

export async function updatePhotoMeta(formData: FormData): Promise<PhotoActionResult> {
  const session = await getAdminSession();
  if (!session) return { error: "認証が必要です。" };

  const parsed = photoMetaUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "入力内容をご確認ください。" };

  const targetType = String(formData.get("targetType"));
  const targetId = String(formData.get("targetId"));

  await prisma.photo.update({
    where: { id: parsed.data.photoId },
    data: {
      caption: parsed.data.caption || null,
      altText: parsed.data.altText || null,
      category: parsed.data.category,
    },
  });

  revalidateTarget(targetType, targetId);
  return {};
}
