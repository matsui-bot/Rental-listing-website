import { describe, expect, it } from "vitest";
import {
  formatYen,
  formatRentManYen,
  formatArea,
  formatWalkMinutes,
  formatDate,
  formatYearMonth,
  splitTags,
  joinTags,
} from "@/lib/format";

describe("format", () => {
  it("formatYen formats with comma separators and 円 suffix", () => {
    expect(formatYen(85000)).toBe("85,000円");
    expect(formatYen(null)).toBe("-");
    expect(formatYen(undefined)).toBe("-");
  });

  it("formatRentManYen converts to 万円 units", () => {
    expect(formatRentManYen(85000)).toBe("8.5万円");
    expect(formatRentManYen(100000)).toBe("10万円");
    expect(formatRentManYen(null)).toBe("-");
  });

  it("formatArea appends m²", () => {
    expect(formatArea(25.5)).toBe("25.5m²");
    expect(formatArea(null)).toBe("-");
  });

  it("formatWalkMinutes formats walk time", () => {
    expect(formatWalkMinutes(5)).toBe("徒歩5分");
    expect(formatWalkMinutes(null)).toBe("-");
  });

  it("formatDate formats to YYYY/MM/DD", () => {
    expect(formatDate(new Date(2026, 6, 1))).toBe("2026/07/01");
    expect(formatDate(null)).toBe("-");
    expect(formatDate("invalid-date")).toBe("-");
  });

  it("formatYearMonth formats YYYY-MM strings", () => {
    expect(formatYearMonth("2015-04")).toBe("2015年4月");
    expect(formatYearMonth(null)).toBe("-");
    expect(formatYearMonth("not-a-date")).toBe("not-a-date");
  });

  it("splitTags/joinTags round-trip comma separated tags", () => {
    expect(splitTags("駅近, 即入居可 ,ペット相談可")).toEqual(["駅近", "即入居可", "ペット相談可"]);
    expect(splitTags(null)).toEqual([]);
    expect(joinTags(["駅近", "即入居可"])).toBe("駅近,即入居可");
  });
});
