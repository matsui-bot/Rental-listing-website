import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/lib/validation/inquiry";
import { loginSchema } from "@/lib/validation/company";
import { buildingSchema } from "@/lib/validation/building";
import { unitSchema } from "@/lib/validation/unit";

describe("contactFormSchema", () => {
  const base = {
    name: "山田太郎",
    phone: "090-1234-5678",
    email: "",
    preferredContactMethod: "PHONE",
    agreeToPolicy: true,
    website: "",
  };

  it("accepts a valid submission with only phone provided", () => {
    const result = contactFormSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects when neither phone nor email is provided", () => {
    const result = contactFormSchema.safeParse({ ...base, phone: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when privacy policy agreement is not checked", () => {
    const result = contactFormSchema.safeParse({ ...base, agreeToPolicy: false });
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
});
