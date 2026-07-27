import { describe, expect, it, beforeAll } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/session-token";
import { hashPassword, verifyPassword } from "@/lib/auth-password";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-key-at-least-16-chars";
});

describe("session token", () => {
  it("round-trips a valid payload", async () => {
    const token = await createSessionToken({ adminId: "1", email: "admin@example.com", name: "Admin" });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ adminId: "1", email: "admin@example.com", name: "Admin" });
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken({ adminId: "1", email: "admin@example.com", name: "Admin" });
    const tampered = `${token.slice(0, -2)}xx`;
    const payload = await verifySessionToken(tampered);
    expect(payload).toBeNull();
  });

  it("rejects garbage input", async () => {
    expect(await verifySessionToken("not-a-jwt")).toBeNull();
  });
});

describe("password hashing", () => {
  // bcrypt (12 rounds) is CPU-bound and can exceed Vitest's 5s default under load; give it headroom.
  const BCRYPT_TEST_TIMEOUT = 20000;

  it(
    "hashes and verifies a correct password",
    async () => {
      const hash = await hashPassword("Sup3rSecret!");
      expect(await verifyPassword("Sup3rSecret!", hash)).toBe(true);
    },
    BCRYPT_TEST_TIMEOUT,
  );

  it(
    "rejects an incorrect password",
    async () => {
      const hash = await hashPassword("Sup3rSecret!");
      expect(await verifyPassword("wrong-password", hash)).toBe(false);
    },
    BCRYPT_TEST_TIMEOUT,
  );
});
