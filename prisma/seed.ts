/**
 * 開発確認用のシードデータ投入スクリプト。
 * 実在する住所・電話番号・免許番号・個人情報は一切使用せず、すべてダミーであることが
 * 明確にわかる内容にしている(要件定義書 セクション17)。
 */
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { hashPassword } from "../src/lib/auth-password";
import { calcNextUpdateDueDate } from "../src/lib/update-schedule";

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "seed");

async function createPlaceholderPhoto(label: string, color: string) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const width = 1200;
  const height = 800;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}" />
      <text x="50%" y="50%" font-size="48" fill="#ffffff" text-anchor="middle"
            dominant-baseline="middle" font-family="sans-serif">${label}</text>
      <text x="50%" y="58%" font-size="24" fill="#ffffffcc" text-anchor="middle"
            dominant-baseline="middle" font-family="sans-serif">(サンプル画像/ダミー)</text>
    </svg>`;

  const mainBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
  const thumbBuffer = await sharp(Buffer.from(svg))
    .resize({ width: 480 })
    .jpeg({ quality: 78 })
    .toBuffer();

  const mainName = `${randomUUID()}.jpg`;
  const thumbName = `${randomUUID()}.jpg`;
  await writeFile(path.join(UPLOAD_DIR, mainName), mainBuffer);
  await writeFile(path.join(UPLOAD_DIR, thumbName), thumbBuffer);

  return {
    url: `/uploads/seed/${mainName}`,
    thumbnailUrl: `/uploads/seed/${thumbName}`,
  };
}

async function main() {
  console.log("シードデータ投入を開始します...");

  // --- 会社情報 -----------------------------------------------------------
  await prisma.companyInfo.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "トラベルエステート株式会社",
      postalCode: "000-0000",
      prefecture: "東京都",
      city: "サンプル区サンプル一丁目",
      addressLine: "1-2-3 ダミービル5F(架空の住所です)",
      phone: "00-0000-0000",
      businessHours: "9:30〜18:30",
      closedDays: "水曜日・年末年始",
      licenseNumber: "国土交通大臣(0)第000000号(ダミー)",
      associations: "公益社団法人 全日本不動産協会(ダミー加盟表示)",
      logoText: "トラベルエステート株式会社",
      topCatchCopy: "自社管理物件を、わかりやすく、探しやすく。",
      topSubCopy: "トラベルエステート株式会社の募集中物件をご案内します。",
      companyIntro:
        "トラベルエステート株式会社は、自社管理物件を中心にご紹介する賃貸仲介会社です(このテキストは開発用のダミー文章です)。",
      privacyPolicyBody:
        "本ページはMVP開発用のダミーのプライバシーポリシーです。実運用前に法務確認のうえ正式な内容に差し替えてください。",
      updateIntervalDays: 14,
      overdueAction: "WARN_ONLY",
    },
  });

  // --- 管理者ユーザー -------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await hashPassword(adminPassword);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      name: "管理担当者(サンプル)",
    },
  });
  console.log(`管理者アカウント: ${adminEmail} / ${adminPassword}`);

  // --- 設備マスター ---------------------------------------------------------
  const equipmentNames = [
    "バス・トイレ別",
    "独立洗面台",
    "室内洗濯機置場",
    "エアコン",
    "オートロック",
    "宅配ボックス",
    "インターネット対応",
    "駐車場",
    "駐輪場",
    "ペット相談",
    "角部屋",
    "即入居可",
  ];
  const equipmentRecords = [];
  for (let i = 0; i < equipmentNames.length; i++) {
    const eq = await prisma.equipmentMaster.upsert({
      where: { name: equipmentNames[i] },
      update: {},
      create: { name: equipmentNames[i], scope: "UNIT", order: i },
    });
    equipmentRecords.push(eq);
  }
  const equipmentByName = new Map(equipmentRecords.map((e) => [e.name, e]));

  // --- 建物・住戸 -----------------------------------------------------------
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  const buildingA = await prisma.building.create({
    data: {
      name: "トラベルコート三軒茶屋(サンプル)",
      nameKana: "とらべるこーとさんげんぢゃや",
      postalCode: "154-0000",
      prefecture: "東京都",
      city: "世田谷区サンプル",
      addressLine: "1-1-1(ダミー住所)",
      structure: "鉄筋コンクリート造",
      totalFloors: 8,
      totalUnits: 32,
      builtYearMonth: "2016-04",
      busInfo: null,
      parkingInfo: "敷地内駐車場あり(空き要確認)",
      surroundingInfo: "スーパー徒歩3分、コンビニ徒歩1分(ダミー情報)",
      commonFacilitiesNote: "オートロック、宅配ボックス、防犯カメラ",
      stations: {
        create: [
          { lineName: "東急田園都市線", stationName: "三軒茶屋", walkMinutes: 6, order: 0 },
          { lineName: "東急世田谷線", stationName: "西太子堂", walkMinutes: 8, order: 1 },
        ],
      },
    },
  });

  const buildingB = await prisma.building.create({
    data: {
      name: "トラベルパーク中目黒(サンプル)",
      nameKana: "とらべるぱーくなかめぐろ",
      postalCode: "153-0000",
      prefecture: "東京都",
      city: "目黒区サンプル",
      addressLine: "2-3-4(ダミー住所)",
      structure: "鉄骨造",
      totalFloors: 5,
      totalUnits: 20,
      builtYearMonth: "2010-09",
      busInfo: null,
      parkingInfo: "駐車場なし",
      surroundingInfo: "目黒川沿い、公園徒歩5分(ダミー情報)",
      commonFacilitiesNote: "駐輪場、宅配ボックス",
      stations: {
        create: [{ lineName: "東急東横線", stationName: "中目黒", walkMinutes: 9, order: 0 }],
      },
    },
  });

  const buildingC = await prisma.building.create({
    data: {
      name: "トラベルレジデンス学芸大学(サンプル)",
      nameKana: "とらべるれじでんすがくげいだいがく",
      postalCode: "152-0000",
      prefecture: "東京都",
      city: "目黒区サンプル2",
      addressLine: "5-6-7(ダミー住所)",
      structure: "鉄筋コンクリート造",
      totalFloors: 10,
      totalUnits: 40,
      builtYearMonth: "2020-02",
      busInfo: "東急バス「学芸大学駅前」より徒歩2分",
      parkingInfo: "近隣に月極駐車場あり",
      surroundingInfo: "商店街近く、教育機関多数(ダミー情報)",
      commonFacilitiesNote: "オートロック、宅配ボックス、エレベーター2基",
      stations: {
        create: [{ lineName: "東急東横線", stationName: "学芸大学", walkMinutes: 4, order: 0 }],
      },
    },
  });

  for (const [building, label, color] of [
    [buildingA, "外観A", "#2f6f4f"],
    [buildingB, "外観B", "#2f4f6f"],
    [buildingC, "外観C", "#6f4f2f"],
  ] as const) {
    const photo = await createPlaceholderPhoto(label, color);
    await prisma.photo.create({
      data: {
        targetType: "BUILDING",
        buildingId: building.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        category: "EXTERIOR",
        caption: `${building.name} 外観(サンプル画像)`,
        altText: `${building.name}の外観写真(ダミー)`,
        order: 0,
        isMain: true,
      },
    });
  }

  interface UnitSeed {
    building: typeof buildingA;
    roomNumber: string;
    managementNumber: string;
    floor: number;
    layoutType: string;
    exclusiveArea: number;
    direction: string;
    rent: number;
    managementFee: number;
    deposit: number;
    keyMoney: number;
    recruitingStatus: string;
    publicationStatus: string;
    publishedDaysAgo: number | null;
    catchCopy: string;
    equipmentNames: string[];
  }

  const unitSeeds: UnitSeed[] = [
    {
      building: buildingA,
      roomNumber: "201",
      managementNumber: "TE-A-201",
      floor: 2,
      layoutType: "1LDK",
      exclusiveArea: 40.2,
      direction: "南",
      rent: 128000,
      managementFee: 8000,
      deposit: 128000,
      keyMoney: 128000,
      recruitingStatus: "RECRUITING",
      publicationStatus: "PUBLISHED",
      publishedDaysAgo: 12,
      catchCopy: "南向き角部屋・駅徒歩6分の1LDK(サンプル)",
      equipmentNames: ["バス・トイレ別", "独立洗面台", "エアコン", "オートロック", "角部屋"],
    },
    {
      building: buildingA,
      roomNumber: "302",
      managementNumber: "TE-A-302",
      floor: 3,
      layoutType: "1K",
      exclusiveArea: 22.5,
      direction: "東",
      rent: 78000,
      managementFee: 5000,
      deposit: 78000,
      keyMoney: 0,
      recruitingStatus: "CONTRACTED",
      publicationStatus: "PUBLISHED",
      publishedDaysAgo: 40,
      catchCopy: "成約済のためサイト非表示になるサンプル住戸",
      equipmentNames: ["エアコン", "オートロック"],
    },
    {
      building: buildingB,
      roomNumber: "101",
      managementNumber: "TE-B-101",
      floor: 1,
      layoutType: "2DK",
      exclusiveArea: 45.0,
      direction: "西",
      rent: 95000,
      managementFee: 4000,
      deposit: 95000,
      keyMoney: 95000,
      recruitingStatus: "RECRUITING",
      publicationStatus: "PUBLISHED",
      publishedDaysAgo: 20,
      catchCopy: "目黒川沿い・広々2DK(サンプル)",
      equipmentNames: ["室内洗濯機置場", "エアコン", "駐輪場", "ペット相談"],
    },
    {
      building: buildingB,
      roomNumber: "102",
      managementNumber: "TE-B-102",
      floor: 1,
      layoutType: "1K",
      exclusiveArea: 20.1,
      direction: "北",
      rent: 68000,
      managementFee: 3000,
      deposit: 68000,
      keyMoney: 68000,
      recruitingStatus: "RECRUITING",
      publicationStatus: "PUBLISHED",
      publishedDaysAgo: 3,
      catchCopy: "駅徒歩9分・お手頃1K(サンプル)",
      equipmentNames: ["エアコン", "インターネット対応", "即入居可"],
    },
    {
      building: buildingC,
      roomNumber: "401",
      managementNumber: "TE-C-401",
      floor: 4,
      layoutType: "1LDK",
      exclusiveArea: 38.7,
      direction: "南東",
      rent: 135000,
      managementFee: 10000,
      deposit: 135000,
      keyMoney: 135000,
      recruitingStatus: "RECRUITING",
      publicationStatus: "PUBLISHED",
      publishedDaysAgo: 1,
      catchCopy: "築浅・駅徒歩4分の高機能物件(サンプル)",
      equipmentNames: ["バス・トイレ別", "独立洗面台", "室内洗濯機置場", "エアコン", "オートロック", "宅配ボックス", "インターネット対応"],
    },
    {
      building: buildingC,
      roomNumber: "402",
      managementNumber: "TE-C-402",
      floor: 4,
      layoutType: "1K",
      exclusiveArea: 24.0,
      direction: "北西",
      rent: 89000,
      managementFee: 6000,
      deposit: 89000,
      keyMoney: 0,
      recruitingStatus: "DRAFT",
      publicationStatus: "UNPUBLISHED",
      publishedDaysAgo: null,
      catchCopy: "下書き状態のサンプル住戸(未公開)",
      equipmentNames: ["エアコン"],
    },
    {
      building: buildingC,
      roomNumber: "403",
      managementNumber: "TE-C-403",
      floor: 4,
      layoutType: "1LDK",
      exclusiveArea: 39.5,
      direction: "南",
      rent: 132000,
      managementFee: 10000,
      deposit: 132000,
      keyMoney: 132000,
      recruitingStatus: "SUSPENDED",
      publicationStatus: "UNPUBLISHED",
      publishedDaysAgo: null,
      catchCopy: "募集停止中のサンプル住戸",
      equipmentNames: ["エアコン", "オートロック"],
    },
  ];

  const createdUnits = [];
  for (const seed of unitSeeds) {
    const publishedAt = seed.publishedDaysAgo !== null ? daysAgo(seed.publishedDaysAgo) : null;
    const nextUpdateDueAt = publishedAt ? calcNextUpdateDueDate(publishedAt, 14) : null;

    const unit = await prisma.unit.create({
      data: {
        buildingId: seed.building.id,
        managementNumber: seed.managementNumber,
        roomNumber: seed.roomNumber,
        floor: seed.floor,
        layoutType: seed.layoutType,
        exclusiveArea: seed.exclusiveArea,
        direction: seed.direction,
        rent: seed.rent,
        managementFee: seed.managementFee,
        commonServiceFee: null,
        deposit: seed.deposit,
        keyMoney: seed.keyMoney,
        guaranteeDeposit: null,
        amortization: null,
        guarantorCompanyFee: 20000,
        fireInsuranceFee: 20000,
        keyExchangeFee: 16500,
        cleaningFee: 33000,
        renewalFee: seed.rent,
        contractPeriod: "2年間",
        contractType: "NORMAL",
        availableDate: seed.publicationStatus === "PUBLISHED" ? "即入居可" : "応相談",
        currentStatus: seed.recruitingStatus === "CONTRACTED" ? "契約済" : "空室",
        recruitingConditions: "連帯保証人または保証会社利用必須(サンプル条件)",
        catchCopy: seed.catchCopy,
        remarks: "この物件情報はすべて開発確認用のダミーデータです。",
        specialTerms: "退去時のクリーニング費用は借主負担(サンプル特約)",
        transactionType: "BROKERAGE",
        featureTags: "駅近,即入居可",
        recruitingStatus: seed.recruitingStatus,
        publicationStatus: seed.publicationStatus,
        publishedAt,
        lastUpdatedAt: publishedAt,
        nextUpdateDueAt,
        otherCosts: {
          create: [
            { name: "更新事務手数料", amount: 16500, taxType: "INCLUDED", isRequired: true, order: 0 },
            { name: "消毒・除菌費用", amount: 22000, taxType: "INCLUDED", isRequired: false, order: 1 },
          ],
        },
        equipment: {
          create: seed.equipmentNames
            .map((n) => equipmentByName.get(n))
            .filter((e): e is NonNullable<typeof e> => Boolean(e))
            .map((e) => ({ equipmentId: e.id })),
        },
      },
    });
    createdUnits.push(unit);

    const mainPhoto = await createPlaceholderPhoto(`${seed.building.name} ${seed.roomNumber}`, "#4f4f4f");
    await prisma.photo.create({
      data: {
        targetType: "UNIT",
        unitId: unit.id,
        url: mainPhoto.url,
        thumbnailUrl: mainPhoto.thumbnailUrl,
        category: "LIVING",
        caption: "室内(サンプル画像)",
        altText: `${seed.building.name} ${seed.roomNumber}号室の室内写真(ダミー)`,
        order: 0,
        isMain: true,
      },
    });
    const floorPlanPhoto = await createPlaceholderPhoto("間取図", "#7f5f3f");
    await prisma.photo.create({
      data: {
        targetType: "UNIT",
        unitId: unit.id,
        url: floorPlanPhoto.url,
        thumbnailUrl: floorPlanPhoto.thumbnailUrl,
        category: "FLOOR_PLAN",
        caption: "間取り図(サンプル画像)",
        altText: `${seed.building.name} ${seed.roomNumber}号室の間取り図(ダミー)`,
        order: 1,
        isMain: false,
      },
    });
  }

  // --- 問い合わせサンプル -----------------------------------------------------
  const inquiryTargets = createdUnits.filter((u) => u.publicationStatus === "PUBLISHED");
  const inquirySeeds = [
    {
      unit: inquiryTargets[0],
      name: "サンプル 太郎",
      phone: "090-0000-0001",
      email: "sample.taro@example.com",
      preferredContactMethod: "PHONE",
      preferredViewingDate: "2026-08-01の午後",
      desiredMoveInTime: "2026年9月上旬",
      message: "駐車場の空き状況を教えてください(ダミー問い合わせ)。",
      status: "NEW",
    },
    {
      unit: inquiryTargets[1],
      name: "サンプル 花子",
      phone: "",
      email: "sample.hanako@example.com",
      preferredContactMethod: "EMAIL",
      preferredViewingDate: "",
      desiredMoveInTime: "できるだけ早く",
      message: "ペット(小型犬)の相談は可能でしょうか(ダミー問い合わせ)。",
      status: "IN_PROGRESS",
    },
    {
      unit: inquiryTargets[2] ?? inquiryTargets[0],
      name: "サンプル 次郎",
      phone: "090-0000-0003",
      email: "",
      preferredContactMethod: "PHONE",
      preferredViewingDate: "",
      desiredMoveInTime: "",
      message: "資料請求をお願いします(ダミー問い合わせ)。",
      status: "DONE",
    },
  ] as const;

  for (const seed of inquirySeeds) {
    if (!seed.unit) continue;
    const building = [buildingA, buildingB, buildingC].find((b) => b.id === seed.unit.buildingId)!;
    await prisma.inquiry.create({
      data: {
        unitId: seed.unit.id,
        buildingName: building.name,
        roomNumber: seed.unit.roomNumber,
        managementNumber: seed.unit.managementNumber,
        name: seed.name,
        phone: seed.phone || null,
        email: seed.email || null,
        preferredContactMethod: seed.preferredContactMethod,
        preferredViewingDate: seed.preferredViewingDate || null,
        desiredMoveInTime: seed.desiredMoveInTime || null,
        message: seed.message || null,
        sourceUrl: `http://localhost:3000/properties/${seed.unit.id}`,
        status: seed.status,
        adminMemo: seed.status === "DONE" ? "資料をメール送付済み(ダミーメモ)" : null,
      },
    });
  }

  console.log("シードデータ投入が完了しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
