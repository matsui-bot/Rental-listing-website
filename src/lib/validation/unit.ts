import { z } from "zod";

export const otherCostSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "費目名を入力してください").max(50),
  amount: z.coerce.number().int().min(0, "金額を入力してください"),
  taxType: z.enum(["INCLUDED", "EXCLUDED", "NON_TAXABLE"]).default("INCLUDED"),
  isRequired: z.coerce.boolean().default(true),
  remarks: z.string().trim().max(200).optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
});

const optionalYen = z.coerce.number().int().min(0).optional().nullable();

/**
 * 「未選択」を表す空文字列を送信するselect用のenumバリデーション。
 * z.enum(...).optional() は undefined のみを許容し空文字列 "" は弾いてしまうため、
 * "" を undefined に変換してから検証する。
 */
function optionalEnum<T extends [string, ...string[]]>(values: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), z.enum(values).optional().nullable());
}

export const unitSchema = z.object({
  buildingId: z.string().trim().min(1, "建物を選択してください"),
  managementNumber: z.string().trim().min(1, "管理番号を入力してください").max(50),
  roomNumber: z.string().trim().min(1, "部屋番号を入力してください").max(30),
  floor: z.coerce.number().int().min(-5).max(200).optional().nullable(),
  layoutType: z.string().trim().min(1, "間取りを選択してください").max(20),
  exclusiveArea: z.coerce.number().min(1, "専有面積を入力してください").max(1000),
  direction: z.string().trim().max(10).optional().or(z.literal("")),

  rent: z.coerce.number().int().min(1, "賃料を入力してください"),
  managementFee: optionalYen,
  commonServiceFee: optionalYen,
  deposit: optionalYen,
  keyMoney: optionalYen,
  guaranteeDeposit: optionalYen,
  amortization: optionalYen,
  guarantorCompanyFee: optionalYen,
  fireInsuranceFee: optionalYen,
  keyExchangeFee: optionalYen,
  cleaningFee: optionalYen,
  renewalFee: optionalYen,

  contractPeriod: z.string().trim().max(30).optional().or(z.literal("")),
  contractType: optionalEnum(["NORMAL", "FIXED_TERM"]),
  availableDate: z.string().trim().max(50).optional().or(z.literal("")),
  currentStatus: z.string().trim().max(30).optional().or(z.literal("")),

  recruitingConditions: z.string().trim().max(500).optional().or(z.literal("")),
  catchCopy: z.string().trim().max(100).optional().or(z.literal("")),
  remarks: z.string().trim().max(2000).optional().or(z.literal("")),
  specialTerms: z.string().trim().max(2000).optional().or(z.literal("")),
  transactionType: optionalEnum(["BROKERAGE", "AGENCY", "LANDLORD"]),
  featureTags: z.string().trim().max(300).optional().or(z.literal("")),

  otherCosts: z.array(otherCostSchema).default([]),
  equipmentIds: z.array(z.string()).default([]),
});

export type UnitInput = z.infer<typeof unitSchema>;

export const unitDuplicateConfirmSchema = z.object({
  roomNumber: z.string().trim().min(1, "部屋番号を入力してください").max(30),
  managementNumber: z.string().trim().min(1, "管理番号を入力してください").max(50),
  rent: z.coerce.number().int().min(1, "賃料を入力してください"),
  managementFee: optionalYen,
  availableDate: z.string().trim().max(50).optional().or(z.literal("")),
});
