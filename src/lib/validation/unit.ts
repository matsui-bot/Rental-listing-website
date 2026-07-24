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
  contractType: z.enum(["NORMAL", "FIXED_TERM"]).optional().nullable(),
  availableDate: z.string().trim().max(50).optional().or(z.literal("")),
  currentStatus: z.string().trim().max(30).optional().or(z.literal("")),

  recruitingConditions: z.string().trim().max(500).optional().or(z.literal("")),
  catchCopy: z.string().trim().max(100).optional().or(z.literal("")),
  remarks: z.string().trim().max(2000).optional().or(z.literal("")),
  specialTerms: z.string().trim().max(2000).optional().or(z.literal("")),
  transactionType: z.enum(["BROKERAGE", "AGENCY", "LANDLORD"]).optional().nullable(),
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
