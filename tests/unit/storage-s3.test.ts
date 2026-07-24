import { describe, expect, it, afterEach } from "vitest";
import { S3StorageProvider } from "@/lib/storage/s3";

const REQUIRED_ENV = ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_BASE_URL"];

afterEach(() => {
  for (const key of REQUIRED_ENV) delete process.env[key];
});

describe("S3StorageProvider", () => {
  it("throws a clear error when required env vars are missing", () => {
    expect(() => new S3StorageProvider()).toThrow(/S3ストレージの環境変数が不足しています/);
  });

  it("reports each missing variable by name", () => {
    process.env.S3_BUCKET = "test-bucket";
    try {
      new S3StorageProvider();
      expect.unreachable("should have thrown");
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toContain("S3_ACCESS_KEY_ID");
      expect(message).toContain("S3_SECRET_ACCESS_KEY");
      expect(message).toContain("S3_PUBLIC_BASE_URL");
      expect(message).not.toContain("S3_BUCKET");
    }
  });

  it("constructs successfully when all required env vars are set", () => {
    process.env.S3_BUCKET = "test-bucket";
    process.env.S3_ACCESS_KEY_ID = "key";
    process.env.S3_SECRET_ACCESS_KEY = "secret";
    process.env.S3_PUBLIC_BASE_URL = "https://pub-example.r2.dev";
    expect(() => new S3StorageProvider()).not.toThrow();
  });
});
