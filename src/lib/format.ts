/**
 * 金額・日付・面積などの表示フォーマットを一元化するユーティリティ。
 * ページやコンポーネントから個別に toLocaleString 等を呼ばず、必ずここを経由する。
 */

const yenFormatter = new Intl.NumberFormat("ja-JP");

/** 円表示(例: 85000 -> "85,000円") */
export function formatYen(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return `${yenFormatter.format(amount)}円`;
}

/** 賃料を万円単位で表示(例: 85000 -> "8.5万円") カード等の短い表示用 */
export function formatRentManYen(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  const man = amount / 10000;
  const rounded = Math.round(man * 10) / 10;
  return `${rounded}万円`;
}

/** 専有面積(例: 25.5 -> "25.5m²") */
export function formatArea(area: number | null | undefined): string {
  if (area === null || area === undefined) return "-";
  return `${area}m²`;
}

/** 徒歩分数(例: 5 -> "徒歩5分") */
export function formatWalkMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "-";
  return `徒歩${minutes}分`;
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 日付(例: 2026-07-01 -> "2026/07/01") */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "-";
  return dateFormatter.format(d);
}

/** 築年月文字列("2015-04")を"2015年4月"形式で表示 */
export function formatYearMonth(yearMonth: string | null | undefined): string {
  if (!yearMonth) return "-";
  const match = /^(\d{4})-(\d{1,2})$/.exec(yearMonth);
  if (!match) return yearMonth;
  const [, year, month] = match;
  return `${year}年${Number(month)}月`;
}

/** 築年月から築年数を計算(表示補助) */
export function calcBuildingAge(yearMonth: string | null | undefined): number | null {
  if (!yearMonth) return null;
  const match = /^(\d{4})-(\d{1,2})$/.exec(yearMonth);
  if (!match) return null;
  const [, year, month] = match;
  const built = new Date(Number(year), Number(month) - 1, 1);
  const now = new Date();
  let age = now.getFullYear() - built.getFullYear();
  if (now.getMonth() < built.getMonth()) age -= 1;
  return Math.max(age, 0);
}

/** カンマ区切り文字列をタグ配列に変換 */
export function splitTags(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export function joinTags(tags: string[]): string {
  return tags.map((t) => t.trim()).filter(Boolean).join(",");
}
