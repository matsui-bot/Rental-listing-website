import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/validation/inquiry";
import { loginSchema } from "@/lib/validation/company";
import { buildingSchema } from "@/lib/validation/building";
import { unitSchema } from "@/lib/validation/unit";

describe("contactFormSchema", () => {
  // FormData から来る値はすべて文字列(チェックボックスは value 属性の文字列、未チェックならキー自体が無い)。
  // JSのbooleanを直接渡すテストは実際のフォーム送信を表しておらず、agreeToPolicy: z.literal(true) の
  // 回帰(文字列 "true" を弾いてしまう不具合)を検出できなかった。実際の FormData 形状でテストする。
  const base = {
    name: "山田太郎",
    phone: "090-1234-5678",
    email: "",
    preferredContactMethod: "PHONE",
    agreeToPolicy: "true",
    website: "",
  };

  it("accepts a valid submission with only phone provided", () => {
    const result = contactFormSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("accepts a submission built from a real FormData object (regression: checkbox sends string, not boolean)", () => {
    const formData = new FormData();
    formData.set("name", "山田太郎");
    formData.set("phone", "090-1234-5678");
    formData.set("preferredContactMethod", "PHONE");
    formData.set("agreeToPolicy", "true"); // checked checkbox with value="true"
    const raw = Object.fromEntries(formData.entries());
    const result = contactFormSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it("rejects when neither phone nor email is provided", () => {
    const result = contactFormSchema.safeParse({ ...base, phone: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when privacy policy agreement is not checked (key absent from FormData, as a real unchecked checkbox sends)", () => {
    const { agreeToPolicy: _omit, ...withoutAgreement } = base;
    const result = contactFormSchema.safeParse(withoutAgreement);
    expect(result.success).toBe(false);
  });

  it("rejects when the honeypot field is filled in", () => {
    const result = contactFormSchema.safeParse({ ...base, website: "http://spam.example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = contactFormSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = contactFormSchema.safeParse({ ...base, name: "" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid email/password", () => {
    expect(loginSchema.safeParse({ email: "admin@example.com", password: "x" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "admin@example.com", password: "" }).success).toBe(false);
  });
});

describe("buildingSchema", () => {
  const validBuilding = {
    name: "サンプルビル",
    postalCode: "150-0000",
    prefecture: "東京都",
    city: "渋谷区",
    addressLine: "1-1-1",
    structure: "RC造",
    totalFloors: "5",
    builtYearMonth: "2020-01",
    stations: [],
  };

  it("accepts a valid building", () => {
    expect(buildingSchema.safeParse(validBuilding).success).toBe(true);
  });

  it("rejects an invalid builtYearMonth format", () => {
    expect(buildingSchema.safeParse({ ...validBuilding, builtYearMonth: "2020/01" }).success).toBe(false);
  });

  it("rejects a missing building name", () => {
    expect(buildingSchema.safeParse({ ...validBuilding, name: "" }).success).toBe(false);
  });
});

describe("unitSchema", () => {
  const validUnit = {
    buildingId: "building-1",
    managementNumber: "TE-001",
    roomNumber: "101",
    layoutType: "1K",
    exclusiveArea: "25",
    rent: "90000",
    otherCosts: [],
    equipmentIds: [],
  };

  it("accepts a minimal valid unit", () => {
    expect(unitSchema.safeParse(validUnit).success).toBe(true);
  });

  it("rejects zero or negative rent", () => {
    expect(unitSchema.safeParse({ ...validUnit, rent: "0" }).success).toBe(false);
  });

  it("rejects a missing buildingId", () => {
    expect(unitSchema.safeParse({ ...validUnit, buildingId: "" }).success).toBe(false);
  });

  it("treats an empty string as unselected for contractType and transactionType (regression: 未選択 option submits '')", () => {
    const result = unitSchema.safeParse({ ...validUnit, contractType: "", transactionType: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contractType).toBeUndefined();
      expect(result.data.transactionType).toBeUndefined();
    }
  });

  it("still rejects a genuinely invalid contractType/transactionType value", () => {
    expect(unitSchema.safeParse({ ...validUnit, contractType: "NOT_REAL" }).success).toBe(false);
    expect(unitSchema.safeParse({ ...validUnit, transactionType: "NOT_REAL" }).success).toBe(false);
  });
});
