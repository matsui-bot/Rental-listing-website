import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** 公開サイトに表示してよい住戸の絞り込み条件(要件定義書 セクション8) */
export function publicUnitWhereClause(now: Date = new Date()): Prisma.UnitWhereInput {
  return {
    isDeleted: false,
    publicationStatus: "PUBLISHED",
    recruitingStatus: "RECRUITING",
    building: { isDeleted: false },
    AND: [
      { OR: [{ publishStartAt: null }, { publishStartAt: { lte: now } }] },
      { OR: [{ publishEndAt: null }, { publishEndAt: { gte: now } }] },
    ],
  };
}

export const publicUnitCardInclude = {
  building: { include: { stations: { orderBy: { order: "asc" as const }, take: 1 } } },
  photos: { orderBy: { order: "asc" as const } },
} satisfies Prisma.UnitInclude;

export type PublicUnitCard = Prisma.UnitGetPayload<{ include: typeof publicUnitCardInclude }>;

export type UnitSortOrder = "newest" | "rent_asc" | "rent_desc";

export interface SearchPublicUnitsParams {
  area?: string;
  maxRent?: number;
  layoutType?: string;
  keyword?: string;
  sort?: UnitSortOrder;
  page?: number;
  pageSize?: number;
}

function sortToOrderBy(sort: UnitSortOrder | undefined): Prisma.UnitOrderByWithRelationInput[] {
  switch (sort) {
    case "rent_asc":
      return [{ rent: "asc" }, { id: "asc" }];
    case "rent_desc":
      return [{ rent: "desc" }, { id: "asc" }];
    case "newest":
    default:
      return [{ publishedAt: "desc" }, { id: "asc" }];
  }
}

/** 一覧ページの検索条件を Prisma の where 句へ変換する(URLクエリ⇔検索条件の単一の変換経路) */
export function buildSearchWhereClause(params: SearchPublicUnitsParams): Prisma.UnitWhereInput {
  const where = publicUnitWhereClause();
  const conditions: Prisma.UnitWhereInput[] = [where];

  if (params.area) {
    conditions.push({
      building: {
        OR: [
          { prefecture: { contains: params.area } },
          { city: { contains: params.area } },
        ],
      },
    });
  }

  if (params.maxRent) {
    conditions.push({ rent: { lte: params.maxRent } });
  }

  if (params.layoutType) {
    conditions.push({ layoutType: params.layoutType });
  }

  if (params.keyword) {
    const keyword = params.keyword;
    conditions.push({
      OR: [
        { building: { name: { contains: keyword } } },
        { building: { addressLine: { contains: keyword } } },
        { catchCopy: { contains: keyword } },
        { featureTags: { contains: keyword } },
        { layoutType: { contains: keyword } },
        { remarks: { contains: keyword } },
      ],
    });
  }

  return { AND: conditions };
}

export async function searchPublicUnits(params: SearchPublicUnitsParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = params.pageSize ?? 20;
  const where = buildSearchWhereClause(params);

  const [items, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      include: publicUnitCardInclude,
      orderBy: sortToOrderBy(params.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.unit.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1) };
}

/** トップページ「エリアから探す」向けに、公開中住戸が存在するエリア(市区町村)を件数付きで返す */
export async function getAvailableAreas(limit = 8) {
  const units = await prisma.unit.findMany({
    where: publicUnitWhereClause(),
    select: { building: { select: { prefecture: true, city: true } } },
  });
  const counts = new Map<string, number>();
  for (const unit of units) {
    const key = `${unit.building.prefecture}${unit.building.city}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getNewArrivalUnits(limit = 6) {
  return prisma.unit.findMany({
    where: publicUnitWhereClause(),
    include: publicUnitCardInclude,
    orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    take: limit,
  });
}

export const publicUnitDetailInclude = {
  building: {
    include: {
      stations: { orderBy: { order: "asc" as const } },
      photos: { orderBy: { order: "asc" as const } },
      equipment: { include: { equipment: true } },
    },
  },
  photos: { orderBy: { order: "asc" as const } },
  otherCosts: { orderBy: { order: "asc" as const } },
  equipment: { include: { equipment: true } },
} satisfies Prisma.UnitInclude;

export type PublicUnitDetail = Prisma.UnitGetPayload<{ include: typeof publicUnitDetailInclude }>;

/** 公開条件を満たす住戸を1件取得する(満たさない場合は null。詳細ページの404判定に使用) */
export async function getPublicUnitById(id: string): Promise<PublicUnitDetail | null> {
  const unit = await prisma.unit.findFirst({
    where: { id, ...publicUnitWhereClause() },
    include: publicUnitDetailInclude,
  });
  return unit;
}

/** 管理画面のプレビュー用: 公開条件を無視して住戸を取得する(認証済み管理者のみが呼び出すこと) */
export async function getUnitDetailForPreview(id: string): Promise<PublicUnitDetail | null> {
  return prisma.unit.findFirst({
    where: { id, isDeleted: false },
    include: publicUnitDetailInclude,
  });
}

/** 同一建物内の他の公開中住戸(関連物件) */
export async function getRelatedUnits(buildingId: string, excludeUnitId: string, limit = 4) {
  return prisma.unit.findMany({
    where: { ...publicUnitWhereClause(), buildingId, NOT: { id: excludeUnitId } },
    include: publicUnitCardInclude,
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
  });
}
