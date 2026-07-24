import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicUnitWhereClause, searchPublicUnits } from "@/lib/data/public-units";

let buildingId: string;

async function createUnit(prisma: PrismaClient, buildingId: string, overrides: Record<string, unknown>) {
  return prisma.unit.create({
    data: {
      buildingId,
      managementNumber: `MGMT-${Math.random().toString(36).slice(2)}`,
      roomNumber: "101",
      layoutType: "1K",
      exclusiveArea: 20,
      rent: 80000,
      recruitingStatus: "RECRUITING",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date(),
      ...overrides,
    },
  });
}

beforeAll(async () => {
  const building = await prisma.building.create({
    data: {
      name: "テストビル",
      postalCode: "150-0000",
      prefecture: "東京都",
      city: "渋谷区",
      addressLine: "1-1-1",
      structure: "RC造",
      totalFloors: 5,
      builtYearMonth: "2020-01",
    },
  });
  buildingId = building.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("公開サイトの表示条件", () => {
  it("募集中かつ公開中の住戸だけが公開条件を満たす", async () => {
    const visible = await createUnit(prisma, buildingId, { rent: 100000 });
    const contracted = await createUnit(prisma, buildingId, { recruitingStatus: "CONTRACTED", rent: 100000 });
    const unpublished = await createUnit(prisma, buildingId, { publicationStatus: "UNPUBLISHED" });

    const results = await prisma.unit.findMany({
      where: { ...publicUnitWhereClause(), id: { in: [visible.id, contracted.id, unpublished.id] } },
    });
    const ids = results.map((u) => u.id);

    expect(ids).toContain(visible.id);
    expect(ids).not.toContain(contracted.id);
    expect(ids).not.toContain(unpublished.id);
  });

  it("成約済に変更すると公開条件から即座に外れる", async () => {
    const unit = await createUnit(prisma, buildingId, {});
    let visible = await prisma.unit.findFirst({ where: { ...publicUnitWhereClause(), id: unit.id } });
    expect(visible).not.toBeNull();

    await prisma.unit.update({ where: { id: unit.id }, data: { recruitingStatus: "CONTRACTED" } });
    visible = await prisma.unit.findFirst({ where: { ...publicUnitWhereClause(), id: unit.id } });
    expect(visible).toBeNull();
  });

  it("公開開始日時前・公開終了日時後の住戸は表示されない", async () => {
    const notYetStarted = await createUnit(prisma, buildingId, {
      publishStartAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    const alreadyEnded = await createUnit(prisma, buildingId, {
      publishEndAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    const results = await prisma.unit.findMany({
      where: { ...publicUnitWhereClause(), id: { in: [notYetStarted.id, alreadyEnded.id] } },
    });
    expect(results).toHaveLength(0);
  });
});

describe("検索・並び替え", () => {
  it("賃料の安い順・高い順に正しく並び替えられる", async () => {
    const building = await prisma.building.create({
      data: {
        name: "ソートテストビル",
        postalCode: "150-0000",
        prefecture: "東京都",
        city: "渋谷区",
        addressLine: "2-2-2",
        structure: "RC造",
        totalFloors: 3,
        builtYearMonth: "2020-01",
      },
    });
    await createUnit(prisma, building.id, { rent: 90000, roomNumber: "A" });
    await createUnit(prisma, building.id, { rent: 50000, roomNumber: "B" });
    await createUnit(prisma, building.id, { rent: 120000, roomNumber: "C" });

    const ascending = await searchPublicUnits({ sort: "rent_asc", pageSize: 50 });
    const rentsAsc = ascending.items.filter((u) => u.buildingId === building.id).map((u) => u.rent);
    expect(rentsAsc).toEqual([50000, 90000, 120000]);

    const descending = await searchPublicUnits({ sort: "rent_desc", pageSize: 50 });
    const rentsDesc = descending.items.filter((u) => u.buildingId === building.id).map((u) => u.rent);
    expect(rentsDesc).toEqual([120000, 90000, 50000]);
  });

  it("賃料上限・間取り・エリア・キーワードで絞り込める", async () => {
    const building = await prisma.building.create({
      data: {
        name: "フィルタテスト目黒ビル",
        postalCode: "150-0000",
        prefecture: "東京都",
        city: "目黒区フィルタ町",
        addressLine: "3-3-3",
        structure: "RC造",
        totalFloors: 3,
        builtYearMonth: "2020-01",
      },
    });
    // 実行のたびに一意なキーワードを使い、テストDBに残った過去データと衝突しないようにする
    const uniqueKeyword = `ユニークキーワード-${Math.random().toString(36).slice(2)}`;
    const target = await createUnit(prisma, building.id, {
      rent: 70000,
      layoutType: "1LDK",
      catchCopy: uniqueKeyword,
    });
    const other = await createUnit(prisma, building.id, { rent: 200000, layoutType: "3LDK" });

    const byMaxRent = await searchPublicUnits({ maxRent: 100000, pageSize: 50 });
    expect(byMaxRent.items.some((u) => u.id === target.id)).toBe(true);
    expect(byMaxRent.items.some((u) => u.id === other.id)).toBe(false);

    const byLayout = await searchPublicUnits({ layoutType: "1LDK", pageSize: 50 });
    expect(byLayout.items.every((u) => u.layoutType === "1LDK")).toBe(true);

    const byArea = await searchPublicUnits({ area: "目黒区フィルタ町", pageSize: 50 });
    expect(byArea.items.some((u) => u.id === target.id)).toBe(true);

    const byKeyword = await searchPublicUnits({ keyword: uniqueKeyword, pageSize: 50 });
    expect(byKeyword.items.map((u) => u.id)).toEqual([target.id]);
  });

  it("0件のときはエラーではなく空配列を返す", async () => {
    const result = await searchPublicUnits({ keyword: "絶対に一致しないはずのキーワード__QA__" });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
