#!/usr/bin/env node
/**
 * prisma/schema.prisma (SQLite, ローカル開発・テスト用) から
 * prisma-postgres/schema.prisma (PostgreSQL, 本番/Vercel用) を生成する。
 *
 * モデル定義は一つの真実の源(prisma/schema.prisma)から生成するため、
 * 手動で2つのスキーマを同期し忘れる事故を防ぐ。差分は datasource ブロックのみ。
 *
 * 実行: node scripts/generate-postgres-schema.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const sourcePath = path.join(rootDir, "prisma", "schema.prisma");
const targetPath = path.join(rootDir, "prisma-postgres", "schema.prisma");

const source = readFileSync(sourcePath, "utf8");

const sqliteDatasourceBlock = /datasource db \{[^}]*\}/s;
if (!sqliteDatasourceBlock.test(source)) {
  throw new Error("prisma/schema.prisma 内に datasource ブロックが見つかりませんでした。");
}

const postgresDatasourceBlock = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

const header = `// 自動生成ファイル: 手動編集しないこと。
// 生成元: prisma/schema.prisma (npm run db:generate:postgres-schema で再生成)
// モデル定義は prisma/schema.prisma を編集し、このファイルはスクリプトで再生成すること。

`;

const generated = header + source.replace(sqliteDatasourceBlock, postgresDatasourceBlock);
writeFileSync(targetPath, generated, "utf8");
console.log(`Generated ${path.relative(rootDir, targetPath)} from ${path.relative(rootDir, sourcePath)}`);
