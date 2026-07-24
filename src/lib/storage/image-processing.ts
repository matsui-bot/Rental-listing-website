import "server-only";
import path from "node:path";
import sharp from "sharp";

const MAX_DIMENSION = 2000;
const THUMBNAIL_WIDTH = 480;

export interface ProcessedImage {
  mainBuffer: Buffer;
  thumbBuffer: Buffer;
  extension: string;
  contentType: string;
}

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** 元画像から本体(最大2000px)とサムネイル(幅480px)を生成する。ローカル/S3互換ストレージ共通処理。 */
export async function processImage(buffer: Buffer, originalFileName: string): Promise<ProcessedImage> {
  const originalExtension = path.extname(originalFileName).toLowerCase();
  const outputExtension = ALLOWED_EXTENSIONS.includes(originalExtension) ? originalExtension : ".jpg";
  const format = outputExtension === ".png" ? "png" : "jpeg";
  const contentType = format === "png" ? "image/png" : "image/jpeg";

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  const mainPipeline =
    metadata.width && metadata.width > MAX_DIMENSION
      ? image.resize({ width: MAX_DIMENSION, withoutEnlargement: true })
      : image;

  const mainBuffer = await mainPipeline.toFormat(format, { quality: 82 }).toBuffer();

  const thumbBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: THUMBNAIL_WIDTH, withoutEnlargement: true })
    .toFormat(format, { quality: 78 })
    .toBuffer();

  return { mainBuffer, thumbBuffer, extension: outputExtension, contentType };
}
