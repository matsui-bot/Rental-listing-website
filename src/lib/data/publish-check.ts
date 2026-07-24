import "server-only";
import { prisma } from "@/lib/prisma";
import { validateUnitForPublish } from "@/lib/publish-validation";
import { calcNextUpdateDueDate } from "@/lib/update-schedule";

/**
 * 指定した住戸を「今公開したら」不足する項目を返す。
 * 情報公開日・次回更新予定日は公開時に自動設定されるため、未設定でもここでは
 * 「これから設定される値」でシミュレートして判定する。
 */
export async function checkUnitPublishReadiness(unitId: string): Promise<string[]> {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      building: { include: { stations: true } },
      photos: true,
    },
  });
  if (!unit) return ["住戸が見つかりません"];

  const company = await prisma.companyInfo.findUnique({ where: { id: "singleton" } });
  const intervalDays = company?.updateIntervalDays ?? 14;
  const now = new Date();
  const simulatedPublishedAt = unit.publishedAt ?? now;
  const simulatedNextUpdateDueAt = unit.nextUpdateDueAt ?? calcNextUpdateDueDate(simulatedPublishedAt, intervalDays);

  return validateUnitForPublish(
    {
      name: unit.building.name,
      postalCode: unit.building.postalCode,
      prefecture: unit.building.prefecture,
      city: unit.building.city,
      addressLine: unit.building.addressLine,
      structure: unit.building.structure,
      totalFloors: unit.building.totalFloors,
      builtYearMonth: unit.building.builtYearMonth,
      stationCount: unit.building.stations.length,
    },
    {
      roomNumber: unit.roomNumber,
      rent: unit.rent,
      managementFee: unit.managementFee,
      commonServiceFee: unit.commonServiceFee,
      layoutType: unit.layoutType,
      exclusiveArea: unit.exclusiveArea,
      deposit: unit.deposit,
      keyMoney: unit.keyMoney,
      availableDate: unit.availableDate,
      contractType: unit.contractType,
      contractPeriod: unit.contractPeriod,
      transactionType: unit.transactionType,
      recruitingStatus: unit.recruitingStatus,
      publishedAt: simulatedPublishedAt,
      nextUpdateDueAt: simulatedNextUpdateDueAt,
      hasMainPhoto: unit.photos.some((p) => p.isMain),
    },
  );
}
