import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * 会社情報はシングルトン行(id="singleton")として保持する。
 * シードが未投入の場合でもアプリが落ちないよう、フォールバック値を返す。
 */
const FALLBACK_COMPANY = {
  id: "singleton",
  name: "トラベルエステート株式会社",
  postalCode: "000-0000",
  prefecture: "東京都",
  city: "未設定",
  addressLine: "管理画面の「会社情報設定」から入力してください",
  phone: "00-0000-0000",
  businessHours: "9:30〜18:30",
  closedDays: "水曜日",
  licenseNumber: "未設定",
  associations: "",
  logoText: "トラベルエステート株式会社",
  logoUrl: null as string | null,
  topCatchCopy: "自社管理物件を、わかりやすく、探しやすく。",
  topSubCopy: "トラベルエステート株式会社の募集中物件をご案内します。",
  companyIntro: "",
  privacyPolicyBody: "",
  updateIntervalDays: 14,
  overdueAction: "WARN_ONLY",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export type CompanyInfoData = typeof FALLBACK_COMPANY;

export async function getCompanyInfo(): Promise<CompanyInfoData> {
  const company = await prisma.companyInfo.findUnique({ where: { id: "singleton" } });
  return company ?? FALLBACK_COMPANY;
}
