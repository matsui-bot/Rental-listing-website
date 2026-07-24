import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

const TEST_DB_PATH = path.join(process.cwd(), "prisma", "test.db");

export default function globalSetup() {
  if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);

  // process.env.DATABASE_URL is provided by `dotenv -e .env.test` (see package.json "test" script)
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    env: process.env,
    stdio: "inherit",
  });

  return () => {
    if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
  };
}
