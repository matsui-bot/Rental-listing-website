import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { checkUnitPublishReadiness } from "@/lib/data/publish-check";
import { contactFormSchema } from "@/lib/validation/inquiry";

let buildingId: string;

beforeAll(async () => {
  const building = await prisma.building.create({
    data: {
      name: "公開チェック用ビル",
      postalCode: "150-0000",
      prefecture: "東京都",
      city: "渋谷区",
      addressLine: "9-9-9",
      structure: "RC造",
      totalFloors: 5,
      builtYearMonth: "2020-01",
      // 交通情報を意図的に登録しない(不足項目として検出されることを確認するため)
    },
  });
  buildingId = building.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("公開前の入力チェック(DB経由)", () => {
  it("必須項目が不足している住戸は公開できない", async () => {
    const unit = await prisma.unit.create({
      data: {
        buildingId,
        managementNumber: `MGMT-${Math.random().toString(36).slice(2)}`,
        roomNumber: "101",
        layoutType: "1K",
        exclusiveArea: 20,
        rent: 80000,
        // deposit/keyMoney/contractType/availableDate等を未設定のまま
        recruitingStatus: "DRAFT",
        publicationStatus: "UNPUBLISHED",
      },
    });

    const missing = await checkUnitPublishReadiness(unit.id);
    expect(missing.length).toBeGreaterThan(0);
    expect(missing).toContain("交通");
    expect(missing).toContain("メイン写真");
  });

  it("必須項目が揃っていれば不足なしと判定される", async () => {
    const unit = await prisma.unit.create({
      data: {
        buildingId,
        managementNumber: `MGMT-${Math.random().toString(36).slice(2)}`,
        roomNumber: "201",
        layoutType: "1K",
        exclusiveArea: 20,
        rent: 80000,
        managementFee: 5000,
        deposit: 80000,
        keyMoney: 80000,
        availableDate: "即入居可",
        contractType: "NORMAL",
        contractPeriod: "2年間",
        transactionType: "BROKERAGE",
        recruitingStatus: "RECRUITING",
      },
    });
    await prisma.buildingStation.create({
      data: { buildingId, lineName: "テスト線", stationName: "テスト駅", walkMinutes: 5 },
    });
    await prisma.photo.create({
      data: { targetType: "UNIT", unitId: unit.id, url: "/uploads/test.jpg", category: "LIVING", isMain: true },
    });

    const missing = await checkUnitPublishReadiness(unit.id);
    expect(missing).toEqual([]);
  });
});

describe("問い合わせの保存", () => {
  it("有効な入力を検証し、問い合わせとしてDBに保存できる", async () => {
    const input = {
      name: "統合テスト太郎",
      phone: "090-0000-0000",
      email: "",
      preferredContactMethod: "PHONE" as const,
      agreeToPolicy: true as const,
      website: "",
    };
    const parsed = contactFormSchema.parse(input);

    const inquiry = await prisma.inquiry.create({
      data: {
        name: parsed.name,
        phone: parsed.phone || null,
        email: parsed.email || null,
        preferredContactMethod: parsed.preferredContactMethod,
        status: "NEW",
      },
    });

    const saved = await prisma.inquiry.findUnique({ where: { id: inquiry.id } });
    expect(saved?.name).toBe("統合テスト太郎");
    expect(saved?.status).toBe("NEW");
  });

  it("不正な入力(同意なし)はバリデーションで拒否される", () => {
    const result = contactFormSchema.safeParse({
      name: "テスト",
      phone: "090-0000-0000",
      preferredContactMethod: "PHONE",
      agreeToPolicy: false,
    });
    expect(result.success).toBe(false);
  });
});
