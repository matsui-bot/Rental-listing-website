/**
 * 募集住戸を「公開」にする際の入力チェック(要件定義書 セクション11)。
 * DB非依存の純粋関数にして単体テストしやすくしている。
 */

export interface PublishValidationBuildingInput {
  name: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  structure: string;
  totalFloors: number | null;
  builtYearMonth: string;
  stationCount: number; // 交通情報が1件以上あるか
}

export interface PublishValidationUnitInput {
  roomNumber: string;
  rent: number | null;
  managementFee: number | null;
  commonServiceFee: number | null;
  layoutType: string;
  exclusiveArea: number | null;
  deposit: number | null;
  keyMoney: number | null;
  availableDate: string | null;
  contractType: string | null;
  contractPeriod: string | null;
  transactionType: string | null;
  recruitingStatus: string;
  publishedAt: Date | null;
  nextUpdateDueAt: Date | null;
  hasMainPhoto: boolean;
}

function isBlank(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * 公開に必要な項目が揃っているか検証する。
 * 不足がある場合は、画面表示用の日本語ラベルの配列を返す(空配列なら公開可能)。
 */
export function validateUnitForPublish(
  building: PublishValidationBuildingInput,
  unit: PublishValidationUnitInput,
): string[] {
  const missing: string[] = [];

  if (isBlank(building.name)) missing.push("建物名");
  if (isBlank(building.postalCode) || isBlank(building.prefecture) || isBlank(building.city) || isBlank(building.addressLine)) {
    missing.push("所在地");
  }
  if (building.stationCount < 1) missing.push("交通");
  if (isBlank(building.structure)) missing.push("構造");
  if (!building.totalFloors || building.totalFloors < 1) missing.push("階数");
  if (isBlank(building.builtYearMonth)) missing.push("築年月");

  if (isBlank(unit.roomNumber)) missing.push("部屋番号");
  if (unit.rent === null || unit.rent <= 0) missing.push("賃料");
  if ((unit.managementFee === null || unit.managementFee === undefined) && (unit.commonServiceFee === null || unit.commonServiceFee === undefined)) {
    missing.push("管理費または共益費");
  }
  if (isBlank(unit.layoutType)) missing.push("間取り");
  if (unit.exclusiveArea === null || unit.exclusiveArea <= 0) missing.push("専有面積");
  if (unit.deposit === null || unit.deposit === undefined) missing.push("敷金");
  if (unit.keyMoney === null || unit.keyMoney === undefined) missing.push("礼金");
  if (isBlank(unit.availableDate)) missing.push("入居可能時期");
  if (isBlank(unit.contractType)) missing.push("契約種類");
  if (isBlank(unit.contractPeriod)) missing.push("契約期間");
  if (isBlank(unit.transactionType)) missing.push("取引態様");
  if (isBlank(unit.recruitingStatus)) missing.push("募集状態");
  if (!unit.hasMainPhoto) missing.push("メイン写真");
  if (!unit.publishedAt) missing.push("情報公開日");
  if (!unit.nextUpdateDueAt) missing.push("次回更新予定日");

  return missing;
}
