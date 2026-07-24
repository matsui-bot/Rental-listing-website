import "server-only";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { SavedImage, StorageProvider } from "./types";
import { processImage } from "./image-processing";

/**
 * S3互換ストレージ(AWS S3 / Cloudflare R2 / MinIO 等)向けの実装。
 * 画像のリサイズ・サムネイル生成は `image-processing.ts` を LocalStorageProvider と共有する。
 *
 * Cloudflare R2 で使う場合の環境変数の例:
 *   S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
 *   S3_REGION="auto"
 *   S3_BUCKET="travel-estate-media"
 *   S3_ACCESS_KEY_ID="..."       (R2 の「APIトークン」から発行するアクセスキー)
 *   S3_SECRET_ACCESS_KEY="..."
 *   S3_PUBLIC_BASE_URL="https://pub-xxxxxxxx.r2.dev"  (バケットの公開URL、またはカスタムドメイン)
 *
 * R2バケットはデフォルトで非公開のため、事前に「パブリックアクセス」を有効にするか、
 * カスタムドメインを紐付けて `S3_PUBLIC_BASE_URL` に設定しておく必要がある。
 */
export class S3StorageProvider implements StorageProvider {
  private client: S3Client | null = null;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    const requiredEnv = ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_BASE_URL"];
    const missing = requiredEnv.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `S3ストレージの環境変数が不足しています: ${missing.join(", ")}。.env.example を参照してください。`,
      );
    }
    this.bucket = process.env.S3_BUCKET!;
    this.publicBaseUrl = process.env.S3_PUBLIC_BASE_URL!.replace(/\/$/, "");
  }

  private getClient(): S3Client {
    if (this.client) return this.client;
    this.client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT,
      // R2をはじめとするS3互換サービスでは path-style アクセスが必要な場合が多い
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    return this.client;
  }

  private keyFor(extension: string): string {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `uploads/${year}/${month}/${randomUUID()}${extension}`;
  }

  async saveImage(buffer: Buffer, originalFileName: string): Promise<SavedImage> {
    const { mainBuffer, thumbBuffer, extension, contentType } = await processImage(buffer, originalFileName);
    const client = this.getClient();

    const mainKey = this.keyFor(extension);
    const thumbKey = this.keyFor(extension);

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: mainKey,
        Body: mainBuffer,
        ContentType: contentType,
      }),
    );
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: contentType,
      }),
    );

    return {
      url: `${this.publicBaseUrl}/${mainKey}`,
      thumbnailUrl: `${this.publicBaseUrl}/${thumbKey}`,
    };
  }

  async deleteImage(url: string): Promise<void> {
    if (!url.startsWith(this.publicBaseUrl)) return;
    const key = url.replace(`${this.publicBaseUrl}/`, "");
    const client = this.getClient();
    try {
      await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch {
      // 既に削除済み等は無視(ローカル実装と挙動を揃える)
    }
  }
}
