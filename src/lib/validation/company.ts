import { z } from "zod";

export const companyInfoSchema = z.object({
  name: z.string().trim().min(1, "会社名を入力してください").max(100),
  postalCode: z.string().trim().min(1, "郵便番号を入力してください").max(10),
  prefecture: z.string().trim().min(1, "都道府県を入力してください").max(10),
  city: z.string().trim().min(1, "市区町村を入力してください").max(50),
  addressLine: z.string().trim().min(1, "住所を入力してください").max(150),
  phone: z.string().trim().min(1, "電話番号を入力してください").max(20),
  businessHours: z.string().trim().min(1, "営業時間を入力してください").max(50),
  closedDays: z.string().trim().min(1, "定休日を入力してください").max(50),
  licenseNumber: z.string().trim().min(1, "宅建業免許番号を入力してください").max(100),
  associations: z.string().trim().max(200).default(""),
  logoText: z.string().trim().min(1).max(50),
  topCatchCopy: z.string().trim().max(100).default(""),
  topSubCopy: z.string().trim().max(150).default(""),
  companyIntro: z.string().trim().max(4000).default(""),
  privacyPolicyBody: z.string().trim().max(20000).default(""),
  updateIntervalDays: z.coerce.number().int().min(1).max(365),
  overdueAction: z.enum(["WARN_ONLY", "AUTO_UNPUBLISH"]),
});

export type CompanyInfoInput = z.infer<typeof companyInfoSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const equipmentMasterSchema = z.object({
  name: z.string().trim().min(1, "設備名を入力してください").max(50),
  scope: z.enum(["BUILDING", "UNIT", "BOTH"]),
  order: z.coerce.number().int().default(0),
});

export type EquipmentMasterInput = z.infer<typeof equipmentMasterSchema>;
