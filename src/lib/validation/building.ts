import { z } from "zod";

export const buildingStationSchema = z.object({
  id: z.string().optional(),
  lineName: z.string().trim().min(1, "路線名を入力してください").max(50),
  stationName: z.string().trim().min(1, "駅名を入力してください").max(50),
  walkMinutes: z.coerce.number().int().min(0).max(999).optional().nullable(),
  busMinutes: z.coerce.number().int().min(0).max(999).optional().nullable(),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export const buildingSchema = z.object({
  name: z.string().trim().min(1, "建物名を入力してください").max(100),
  nameKana: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().min(1, "郵便番号を入力してください").max(10),
  prefecture: z.string().trim().min(1, "都道府県を選択してください").max(10),
  city: z.string().trim().min(1, "市区町村を入力してください").max(50),
  addressLine: z.string().trim().min(1, "町名番地を入力してください").max(100),
  addressLine2: z.string().trim().max(100).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  addressDisclosureLevel: z.enum(["FULL", "CITY_ONLY"]).default("FULL"),
  structure: z.string().trim().min(1, "構造を入力してください").max(50),
  totalFloors: z.coerce.number().int().min(1, "総階数を入力してください").max(200),
  totalUnits: z.coerce.number().int().min(0).max(9999).optional().nullable(),
  builtYearMonth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, "築年月は YYYY-MM 形式で入力してください"),
  busInfo: z.string().trim().max(200).optional().or(z.literal("")),
  parkingInfo: z.string().trim().max(200).optional().or(z.literal("")),
  surroundingInfo: z.string().trim().max(1000).optional().or(z.literal("")),
  commonFacilitiesNote: z.string().trim().max(500).optional().or(z.literal("")),
  stations: z.array(buildingStationSchema).default([]),
});

export type BuildingInput = z.infer<typeof buildingSchema>;
