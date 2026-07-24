import "server-only";
import type { SavedImage, StorageProvider } from "./types";

/**
 * S3互換ストレージ(AWS S3 / Cloudflare R2 / MinIO 等)向けの実装スタブ。
 *
 * 設計方針:
 *   アプリケーションコードは `StorageProvider` インターフェースのみに依存しており、
 *   本番で外部ストレージへ切り替える際はこのファイルの中身を実装するだけでよい。
 *   MVPでは不要な大規模ライブラリ(AWS SDK等)を追加しないため、実処理は未実装とし、
 *   意図的にエラーを送出して「未設定のまま本番投入されること」を防いでいる。
 *
 * 本番導入時の実装手順(README にも記載):
 *   1. `npm install @aws-sdk/client-s3`
 *   2. 下記2メソッドを PutObjectCommand / DeleteObjectCommand を使って実装
 *      (リサイズ・サムネイル生成のロジックは LocalStorageProvider と同様に sharp を再利用できる)
 *   3. .env で STORAGE_DRIVER=s3 と S3_* 系の環境変数を設定
 */
export class S3StorageProvider implements StorageProvider {
  async saveImage(_buffer: Buffer, _originalFileName: string): Promise<SavedImage> {
    throw new Error(
      "S3StorageProvider は未実装です。src/lib/storage/s3.ts のコメントを参照して実装するか、" +
        "STORAGE_DRIVER=local を使用してください。",
    );
  }

  async deleteImage(_url: string): Promise<void> {
    throw new Error(
      "S3StorageProvider は未実装です。src/lib/storage/s3.ts のコメントを参照して実装するか、" +
        "STORAGE_DRIVER=local を使用してください。",
    );
  }
}
