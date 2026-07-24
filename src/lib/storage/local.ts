import "server-only";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { SavedImage, StorageProvider } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_DIMENSION = 2000;
const THUMBNAIL_WIDTH = 480;

function yearMonthDir(): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return path.join(year, month);
}

/** 安全なファイル名を生成する(元のファイル名は保持しない: パストラバーサル・文字化け対策) */
function safeFileName(extension: string): string {
  return `${randomUUID()}${extension}`;
}

export class LocalStorageProvider implements StorageProvider {
  async saveImage(buffer: Buffer, originalFileName: string): Promise<SavedImage> {
    const subDir = yearMonthDir();
    const dirAbsolute = path.join(UPLOAD_ROOT, subDir);
    await mkdir(dirAbsolute, { recursive: true });

    const originalExtension = path.extname(originalFileName).toLowerCase();
    const outputExtension = [".jpg", ".jpeg", ".png", ".webp"].includes(originalExtension)
      ? originalExtension
      : ".jpg";

    const mainName = safeFileName(outputExtension);
    const thumbName = safeFileName(outputExtension);

    const image = sharp(buffer, { failOn: "none" }).rotate();
    const metadata = await image.metadata();

    const mainPipeline =
      metadata.width && metadata.width > MAX_DIMENSION
        ? image.resize({ width: MAX_DIMENSION, withoutEnlargement: true })
        : image;

    const mainBuffer = await mainPipeline
      .toFormat(outputExtension === ".png" ? "png" : "jpeg", { quality: 82 })
      .toBuffer();

    const thumbBuffer = await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
      .toFormat(outputExtension === ".png" ? "png" : "jpeg", { quality: 78 })
      .toBuffer();

    await writeFile(path.join(dirAbsolute, mainName), mainBuffer);
    await writeFile(path.join(dirAbsolute, thumbName), thumbBuffer);

    const urlBase = `/uploads/${subDir.replace(/\\/g, "/")}`;
    return {
      url: `${urlBase}/${mainName}`,
      thumbnailUrl: `${urlBase}/${thumbName}`,
    };
  }

  async deleteImage(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const relative = url.replace(/^\/uploads\//, "");
    const absolute = path.join(UPLOAD_ROOT, relative);
    try {
      await unlink(absolute);
    } catch {
      // ファイルが既に存在しない場合は無視
    }
  }
}
