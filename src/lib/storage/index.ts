import "server-only";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";
import type { StorageProvider } from "./types";

export type { StorageProvider, SavedImage } from "./types";

let cachedProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cachedProvider) return cachedProvider;
  const driver = process.env.STORAGE_DRIVER || "local";
  cachedProvider = driver === "s3" ? new S3StorageProvider() : new LocalStorageProvider();
  return cachedProvider;
}
