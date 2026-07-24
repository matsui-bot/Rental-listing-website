import { describe, expect, it } from "vitest";
import { calcNextUpdateDueDate, isOverdue, isUpcoming, getUpdateUrgency } from "@/lib/update-schedule";

describe("update-schedule", () => {
  it("calcNextUpdateDueDate adds the given number of days", () => {
    const base = new Date("2026-01-01T00:00:00Z");
    const result = calcNextUpdateDueDate(base, 14);
    expect(result.toISOString()).toBe("2026-01-15T00:00:00.000Z");
  });

  it("isOverdue returns true only when due date is in the past", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(isOverdue(new Date("2026-01-09T00:00:00Z"), now)).toBe(true);
    expect(isOverdue(new Date("2026-01-11T00:00:00Z"), now)).toBe(false);
    expect(isOverdue(null, now)).toBe(false);
  });

  it("isUpcoming returns true within the threshold window but not overdue", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(isUpcoming(new Date("2026-01-12T00:00:00Z"), now, 3)).toBe(true);
    expect(isUpcoming(new Date("2026-01-15T00:00:00Z"), now, 3)).toBe(false);
    expect(isUpcoming(new Date("2026-01-09T00:00:00Z"), now, 3)).toBe(false);
  });

  it("getUpdateUrgency classifies overdue/upcoming/normal correctly", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(getUpdateUrgency(new Date("2026-01-01T00:00:00Z"), now)).toBe("overdue");
    expect(getUpdateUrgency(new Date("2026-01-11T00:00:00Z"), now)).toBe("upcoming");
    expect(getUpdateUrgency(new Date("2026-02-01T00:00:00Z"), now)).toBe("normal");
    expect(getUpdateUrgency(null, now)).toBe("normal");
  });
});
