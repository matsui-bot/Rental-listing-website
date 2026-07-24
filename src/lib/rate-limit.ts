import "server-only";

/**
 * 簡易的なインメモリ・レートリミッタ(問い合わせフォームのスパム対策)。
 * 単一プロセス運用を前提としたMVP向けの実装。複数インスタンスでスケールする場合は
 * Redis 等の共有ストアに置き換えること(README に記載)。
 */
const attemptsByKey = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000; // 10分
const MAX_ATTEMPTS_PER_WINDOW = 5;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (attemptsByKey.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_ATTEMPTS_PER_WINDOW) {
    attemptsByKey.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  attemptsByKey.set(key, timestamps);
  return false;
}
