import { z } from "zod";

export const MAX_UPLOAD_FILE_SIZE = 8 * 1024 * 1024; // 8MB
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const photoUploadMetaSchema = z.object({
  targetType: z.enum(["BUILDING", "UNIT"]),
  targetId: z.string().min(1),
  category: z.enum([
    "EXTERIOR",
    "ENTRANCE",
    "COMMON_AREA",
    "LIVING",
    "WESTERN_ROOM",
    "KITCHEN",
    "BATH",
    "TOILET",
    "WASHROOM",
    "STORAGE",
    "BALCONY",
    "VIEW",
    "FLOOR_PLAN",
    "OTHER",
  ]),
});

export const photoMetaUpdateSchema = z.object({
  photoId: z.string().min(1),
  caption: z.string().trim().max(200).optional().or(z.literal("")),
  altText: z.string().trim().max(200).optional().or(z.literal("")),
  category: photoUploadMetaSchema.shape.category,
});
