/**
 * ドメイン上の状態値の定義。
 * SQLite は enum をサポートしないため、DB上は String 列として保持し、
 * アプリケーション層(ここ)で union 型と表示ラベルを一元管理する。
 */

export const RECRUITING_STATUS = {
  DRAFT: "DRAFT",
  RECRUITING: "RECRUITING",
  APPLICATION_RECEIVED: "APPLICATION_RECEIVED",
  CONTRACTED: "CONTRACTED",
  SUSPENDED: "SUSPENDED",
  UPDATE_PENDING: "UPDATE_PENDING",
} as const;
export type RecruitingStatus = (typeof RECRUITING_STATUS)[keyof typeof RECRUITING_STATUS];

export const RECRUITING_STATUS_LABEL: Record<RecruitingStatus, string> = {
  DRAFT: "下書き",
  RECRUITING: "募集中",
  APPLICATION_RECEIVED: "申込あり",
  CONTRACTED: "成約済",
  SUSPENDED: "募集停止",
  UPDATE_PENDING: "更新確認待ち",
};

/** 公開サイトに表示してよい募集状態(この状態以外は非表示) */
export const PUBLIC_VISIBLE_RECRUITING_STATUSES: RecruitingStatus[] = ["RECRUITING"];

export const PUBLICATION_STATUS = {
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED",
} as const;
export type PublicationStatus = (typeof PUBLICATION_STATUS)[keyof typeof PUBLICATION_STATUS];

export const PUBLICATION_STATUS_LABEL: Record<PublicationStatus, string> = {
  PUBLISHED: "公開",
  UNPUBLISHED: "非公開",
};

export const CONTRACT_TYPE = {
  NORMAL: "NORMAL",
  FIXED_TERM: "FIXED_TERM",
} as const;
export type ContractType = (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE];

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  NORMAL: "普通借家",
  FIXED_TERM: "定期借家",
};

export const TRANSACTION_TYPE = {
  BROKERAGE: "BROKERAGE",
  AGENCY: "AGENCY",
  LANDLORD: "LANDLORD",
} as const;
export type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  BROKERAGE: "媒介",
  AGENCY: "代理",
  LANDLORD: "貸主",
};

export const TAX_TYPE = {
  INCLUDED: "INCLUDED",
  EXCLUDED: "EXCLUDED",
  NON_TAXABLE: "NON_TAXABLE",
} as const;
export type TaxType = (typeof TAX_TYPE)[keyof typeof TAX_TYPE];

export const TAX_TYPE_LABEL: Record<TaxType, string> = {
  INCLUDED: "税込",
  EXCLUDED: "税別",
  NON_TAXABLE: "非課税",
};

export const ADDRESS_DISCLOSURE_LEVEL = {
  FULL: "FULL",
  CITY_ONLY: "CITY_ONLY",
} as const;
export type AddressDisclosureLevel =
  (typeof ADDRESS_DISCLOSURE_LEVEL)[keyof typeof ADDRESS_DISCLOSURE_LEVEL];

export const OVERDUE_ACTION = {
  WARN_ONLY: "WARN_ONLY",
  AUTO_UNPUBLISH: "AUTO_UNPUBLISH",
} as const;
export type OverdueAction = (typeof OVERDUE_ACTION)[keyof typeof OVERDUE_ACTION];

export const OVERDUE_ACTION_LABEL: Record<OverdueAction, string> = {
  WARN_ONLY: "警告のみ",
  AUTO_UNPUBLISH: "自動的に非公開",
};

export const PHOTO_TARGET_TYPE = {
  BUILDING: "BUILDING",
  UNIT: "UNIT",
} as const;
export type PhotoTargetType = (typeof PHOTO_TARGET_TYPE)[keyof typeof PHOTO_TARGET_TYPE];

export const PHOTO_CATEGORY = {
  EXTERIOR: "EXTERIOR",
  ENTRANCE: "ENTRANCE",
  COMMON_AREA: "COMMON_AREA",
  LIVING: "LIVING",
  WESTERN_ROOM: "WESTERN_ROOM",
  KITCHEN: "KITCHEN",
  BATH: "BATH",
  TOILET: "TOILET",
  WASHROOM: "WASHROOM",
  STORAGE: "STORAGE",
  BALCONY: "BALCONY",
  VIEW: "VIEW",
  FLOOR_PLAN: "FLOOR_PLAN",
  OTHER: "OTHER",
} as const;
export type PhotoCategory = (typeof PHOTO_CATEGORY)[keyof typeof PHOTO_CATEGORY];

export const PHOTO_CATEGORY_LABEL: Record<PhotoCategory, string> = {
  EXTERIOR: "外観",
  ENTRANCE: "エントランス",
  COMMON_AREA: "共用部分",
  LIVING: "リビング",
  WESTERN_ROOM: "洋室",
  KITCHEN: "キッチン",
  BATH: "浴室",
  TOILET: "トイレ",
  WASHROOM: "洗面所",
  STORAGE: "収納",
  BALCONY: "バルコニー",
  VIEW: "眺望",
  FLOOR_PLAN: "間取り図",
  OTHER: "その他",
};

export const EQUIPMENT_SCOPE = {
  BUILDING: "BUILDING",
  UNIT: "UNIT",
  BOTH: "BOTH",
} as const;
export type EquipmentScope = (typeof EQUIPMENT_SCOPE)[keyof typeof EQUIPMENT_SCOPE];

export const CONTACT_METHOD = {
  PHONE: "PHONE",
  EMAIL: "EMAIL",
} as const;
export type ContactMethod = (typeof CONTACT_METHOD)[keyof typeof CONTACT_METHOD];

export const CONTACT_METHOD_LABEL: Record<ContactMethod, string> = {
  PHONE: "電話",
  EMAIL: "メール",
};

export const INQUIRY_STATUS = {
  NEW: "NEW",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;
export type InquiryStatus = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "未対応",
  IN_PROGRESS: "対応中",
  DONE: "対応完了",
  CANCELLED: "対応不要",
};

/** 間取りの選択肢(フリー入力ではなくマスタ的に扱うことで検索の一貫性を保つ) */
export const LAYOUT_TYPES = [
  "ワンルーム",
  "1K",
  "1DK",
  "1LDK",
  "2K",
  "2DK",
  "2LDK",
  "3K",
  "3DK",
  "3LDK",
  "4LDK以上",
] as const;
export type LayoutType = (typeof LAYOUT_TYPES)[number];

/** 都道府県(このサイトは自社管理物件が中心の想定のため簡易リスト) */
export const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
] as const;

export const RENT_UPPER_LIMIT_OPTIONS = [
  50000, 60000, 70000, 80000, 90000, 100000, 120000, 150000, 200000, 300000,
] as const;

/** 特徴タグの候補(建物・住戸の featureTags で自由に使えるが、検索側のヒントとして提示) */
export const FEATURE_TAG_SUGGESTIONS = [
  "ペット相談可",
  "駅近",
  "角部屋",
  "即入居可",
  "オートロック",
  "宅配ボックス",
  "築浅",
  "リノベーション",
  "南向き",
  "駐車場空きあり",
] as const;
