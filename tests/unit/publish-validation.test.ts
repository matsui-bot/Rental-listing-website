import { describe, expect, it } from "vitest";
import { validateUnitForPublish, type PublishValidationBuildingInput, type PublishValidationUnitInput } from "@/lib/publish-validation";

const validBuilding: PublishValidationBuildingInput = {
  name: "サンプルビル",
  postalCode: "150-0000",
  prefecture: "東京都",
  city: "渋谷区",
  addressLine: "1-1-1",
  structure: "RC造",
  totalFloors: 5,
  builtYearMonth: "2020-01",
  stationCount: 1,
};

const validUnit: PublishValidationUnitInput = {
  roomNumber: "101",
  rent: 90000,
  managementFee: 5000,
  commonServiceFee: null,
  layoutType: "1K",
  exclusiveArea: 25,
  deposit: 90000,
  keyMoney: 90000,
  availableDate: "即入居可",
  contractType: "NORMAL",
  contractPeriod: "2年間",
  transactionType: "BROKERAGE",
  recruitingStatus: "RECRUITING",
  publishedAt: new Date(),
  nextUpdateDueAt: new Date(),
  hasMainPhoto: true,
};

describe("validateUnitForPublish", () => {
  it("returns no missing fields when everything required is present", () => {
    expect(validateUnitForPublish(validBuilding, validUnit)).toEqual([]);
  });

  it("flags a missing building name", () => {
    const missing = validateUnitForPublish({ ...validBuilding, name: "" }, validUnit);
    expect(missing).toContain("建物名");
  });

  it("flags missing address components", () => {
    const missing = validateUnitForPublish({ ...validBuilding, city: "" }, validUnit);
    expect(missing).toContain("所在地");
  });

  it("flags missing transportation info", () => {
    const missing = validateUnitForPublish({ ...validBuilding, stationCount: 0 }, validUnit);
    expect(missing).toContain("交通");
  });

  it("allows either managementFee or commonServiceFee but flags when both are missing", () => {
    const missing = validateUnitForPublish(validBuilding, {
      ...validUnit,
      managementFee: null,
      commonServiceFee: null,
    });
    expect(missing).toContain("管理費または共益費");

    const okWithCommonServiceFee = validateUnitForPublish(validBuilding, {
      ...validUnit,
      managementFee: null,
      commonServiceFee: 5000,
    });
    expect(okWithCommonServiceFee).not.toContain("管理費または共益費");
  });

  it("flags a missing main photo", () => {
    const missing = validateUnitForPublish(validBuilding, { ...validUnit, hasMainPhoto: false });
    expect(missing).toContain("メイン写真");
  });

  it("flags zero or negative rent as missing", () => {
    const missing = validateUnitForPublish(validBuilding, { ...validUnit, rent: 0 });
    expect(missing).toContain("賃料");
  });

  it("flags missing publishedAt/nextUpdateDueAt", () => {
    const missing = validateUnitForPublish(validBuilding, { ...validUnit, publishedAt: null, nextUpdateDueAt: null });
    expect(missing).toContain("情報公開日");
    expect(missing).toContain("次回更新予定日");
  });
});
