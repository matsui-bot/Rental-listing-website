/**
 * 広告更新管理(要件定義書 セクション10)関連のロジック。
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** ダッシュボード・更新期限一覧で「更新期限が近い」とみなす既定の日数 */
export const DEFAULT_UPCOMING_THRESHOLD_DAYS = 3;

/** 基準日から intervalDays 日後の日付を返す(次回更新予定日の算出) */
export function calcNextUpdateDueDate(baseDate: Date, intervalDays: number): Date {
  return new Date(baseDate.getTime() + intervalDays * MS_PER_DAY);
}

/** 次回更新予定日を過ぎているか */
export function isOverdue(nextUpdateDueAt: Date | null, now: Date = new Date()): boolean {
  if (!nextUpdateDueAt) return false;
  return nextUpdateDueAt.getTime() < now.getTime();
}

/** 次回更新予定日が近づいているか(既定: 3日以内、期限超過は含まない) */
export function isUpcoming(
  nextUpdateDueAt: Date | null,
  now: Date = new Date(),
  thresholdDays = DEFAULT_UPCOMING_THRESHOLD_DAYS,
): boolean {
  if (!nextUpdateDueAt) return false;
  const diff = nextUpdateDueAt.getTime() - now.getTime();
  return diff >= 0 && diff <= thresholdDays * MS_PER_DAY;
}

export type UpdateUrgency = "overdue" | "upcoming" | "normal";

export function getUpdateUrgency(
  nextUpdateDueAt: Date | null,
  now: Date = new Date(),
  thresholdDays = DEFAULT_UPCOMING_THRESHOLD_DAYS,
): UpdateUrgency {
  if (isOverdue(nextUpdateDueAt, now)) return "overdue";
  if (isUpcoming(nextUpdateDueAt, now, thresholdDays)) return "upcoming";
  return "normal";
}
