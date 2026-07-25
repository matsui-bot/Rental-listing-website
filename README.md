# トラベルエステート株式会社 賃貸物件広告サイト

トラベルエステート株式会社の管理物件を広告するための賃貸物件広告サイト(MVP)。
「物件掲載」「募集状況の更新」「問い合わせ獲得」に重点を置いたシンプルな構成。

## 1. システム概要

- 公開サイト: トップページ／物件一覧／物件詳細／会社案内／お問い合わせ／プライバシーポリシー
- 管理画面: 建物管理／募集住戸管理(公開・非公開／募集状態／複製／写真管理)／問い合わせ管理／更新期限管理／会社情報設定／設備マスター
- データは「建物」と「募集住戸」を分離し、同一建物内の複数住戸で住所・築年月・駅情報等を使い回せる設計

## 2. 使用技術

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| ORM | Prisma 6 |
| DB(開発) | SQLite |
| DB(本番想定) | PostgreSQL(切替方法は本書「14」参照) |
| 認証 | 独自実装(bcryptjs によるパスワードハッシュ + jose による署名付きセッションCookie) |
| バリデーション | Zod |
| 画像処理 | sharp(リサイズ・サムネイル生成) |
| メール送信(任意) | Nodemailer |
| テスト | Vitest |

## 3. 必要環境

- Node.js 20 以上(開発時は Node.js 24 で動作確認)
- npm

## 4. インストール方法

```bash
npm install
cp .env.example .env
# .env の SESSION_SECRET 等を必要に応じて編集
```

## 5. 環境変数

`.env.example` を参照。主な項目:

| 変数名 | 説明 |
|---|---|
| `DATABASE_URL` | DB接続文字列。開発は `file:./dev.db`(SQLite) |
| `SESSION_SECRET` | 管理画面セッション署名用シークレット。本番では十分に長いランダム値に変更必須 |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | `db:seed` 実行時のみ使用する初期管理者アカウント。本番運用ではこの値をコードに残さず、別途安全な方法でアカウントを作成すること(本書「11」参照) |
| `STORAGE_DRIVER` | `local`(既定) または `s3` |
| `S3_*` | `STORAGE_DRIVER=s3` の場合のS3互換ストレージ設定(本書「13」参照) |
| `SMTP_*` / `MAIL_FROM` / `MAIL_TO_ADMIN` | 問い合わせ受信時の管理者通知メール(未設定なら送信をスキップしDB保存のみ行う) |
| `SITE_URL` | サイトの絶対URL。sitemap.xml・OGP・構造化データで使用 |

## 6. データベース初期化方法

```bash
npx prisma migrate dev --name init
```

初回は本手順で `prisma/dev.db` が作成され、`prisma/migrations/` のマイグレーションが適用される。

## 7. マイグレーション方法

スキーマ(`prisma/schema.prisma`)を変更した場合:

```bash
npm run db:migrate   # = prisma migrate dev
```

本番環境への適用は `npx prisma migrate deploy` を使用すること(`migrate dev` は開発専用)。

## 8. シードデータ投入方法

```bash
npm run db:seed
```

以下がダミーデータとして投入される(実在の住所・電話番号・免許番号・個人情報は使用していない):

- 会社情報 1件
- 建物 3件(それぞれ交通情報・外観写真つき)
- 募集住戸 7件(公開中4件/成約済1件/下書き1件/募集停止1件 — 公開条件のテスト用にステータスを分散)
- 各住戸の写真(メイン写真・間取り図)
- 設備マスター 12件
- その他費用サンプル
- 問い合わせサンプル 3件(対応状況違い)

投入後、以下でログインできる(`.env` の `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` を変更していない場合):

```
email: admin@example.com
password: ChangeMe123!
```

## 9. 開発サーバー起動方法

```bash
npm run dev
```

`http://localhost:3000` で公開サイト、`http://localhost:3000/admin/login` で管理画面ログインにアクセスできる。

## 10. テスト実行方法

```bash
npm test
```

- Vitest を使用。`.env.test` に定義された専用のSQLite DB(`prisma/test.db`)へ接続し、実行の最初にスキーマを反映、終了後にファイルを削除する(開発用DBには影響しない)。
- テスト内容:
  - 単体テスト: 金額・日付フォーマット、公開前入力チェック(`validateUnitForPublish`)、更新期限計算、Zodバリデーションスキーマ、パスワードハッシュ/セッショントークン
  - 統合テスト(実DB使用): 募集中かつ公開中のみ表示される／成約済に変更すると即非表示になる／公開開始・終了日時の判定／賃料順ソート／エリア・賃料上限・間取り・キーワード絞り込み／0件時に空配列を返す／公開前必須項目チェック／問い合わせ保存とバリデーション

## 11. 管理者アカウントの作成方法

MVPでは管理者は単一ロールのみ。アカウントは `AdminUser` テーブルに `email` / `passwordHash`(bcrypt) / `name` を保持する。

- 開発時: `npm run db:seed` で `.env` の `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` から作成される。
- 本番運用時: シードスクリプトの初期パスワードをそのまま使わないこと。以下のような一時スクリプトで作成し、作成後は削除することを推奨する。

```ts
// 例: create-admin.ts (一時的に作成し、実行後は削除する)
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./src/lib/auth-password";

const prisma = new PrismaClient();
const passwordHash = await hashPassword("(十分に強いパスワードに置き換える)");
await prisma.adminUser.create({
  data: { email: "admin@your-company.example", passwordHash, name: "管理担当者" },
});
```

将来的に複数管理者・権限分けが必要になった場合も、`AdminUser` テーブルへの列追加で対応できる設計にしている。

## 12. 本番デプロイ時の注意点

- `SESSION_SECRET` を必ず長いランダム値に変更する(`openssl rand -base64 32` 等)。
- `SEED_ADMIN_PASSWORD` を含む `.env.example` の値を本番にコピーしない。本番の初期管理者は「11」の手順で個別作成する。
- `DATABASE_URL` を PostgreSQL 等の永続DBに切り替える(本書「14」)。
- `STORAGE_DRIVER` をローカル以外(S3等)に切り替える(本書「13」)。ローカルストレージのままサーバーレス環境やコンテナの使い捨てファイルシステムにデプロイすると、アップロード画像が消失する。
- 更新期限超過の自動非公開処理(`enforceOverdueAutoUnpublish`)は、現状は管理画面のダッシュボード/更新期限一覧を開いたタイミングでのみ評価される簡易実装。本番では Cron 等の定期実行ジョブから同等の処理を呼び出す仕組みを追加することを推奨する。
- 問い合わせフォームのレート制限(`src/lib/rate-limit.ts`)はインメモリ実装のため、複数インスタンス構成では効果が薄まる。本番でスケールする場合は Redis 等の共有ストアに置き換えること。

## 13. 画像ストレージの変更方法

`src/lib/storage/` に `StorageProvider` インターフェースを定義し、`STORAGE_DRIVER` 環境変数で実装を切り替える設計にしている。リサイズ・サムネイル生成(`image-processing.ts`)はローカル/S3互換ストレージで共通。

- `local`(既定): `public/uploads/` 配下に保存。開発環境向け。Vercel等のサーバーレス環境ではファイルシステムが一時的なため本番では使用不可。
- `s3`: `@aws-sdk/client-s3` を使用してS3互換ストレージ(AWS S3 / Cloudflare R2 / MinIO 等)に保存する実装済み。**Cloudflare R2 での設定手順:**
  1. Cloudflareダッシュボード → R2 でバケットを作成(例: `travel-estate-media`)
  2. バケットの Settings → Public access を有効化(または任意のカスタムドメインを紐付け)し、公開URL(`https://pub-xxxxxxxx.r2.dev` 等)を控える
  3. 「R2 API トークンの管理」からアクセスキー(Access Key ID / Secret Access Key)を発行
  4. `.env` に以下を設定(`.env.example` にコメント付きで記載済み):
     ```
     STORAGE_DRIVER="s3"
     S3_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
     S3_REGION="auto"
     S3_BUCKET="travel-estate-media"
     S3_ACCESS_KEY_ID="..."
     S3_SECRET_ACCESS_KEY="..."
     S3_PUBLIC_BASE_URL="https://pub-xxxxxxxx.r2.dev"
     ```
  5. `next.config.ts` は `S3_PUBLIC_BASE_URL` のホスト名と `*.r2.dev` を自動的に `images.remotePatterns` に登録するため、追加設定は不要

アプリケーションコード側は `getStorageProvider()` 経由でしか画像保存処理を呼び出さないため、`.env` の切り替えだけでローカル/S3互換ストレージを変更できる。

## 14. データベースをPostgreSQLへ変更する方法

**Vercelにデプロイする場合**は、本プロジェクトに同梱済みの `prisma-postgres/` (生成スキーマ + マイグレーション)をそのまま使えるため、この節の作業は不要。本書「19」を参照。

Vercel以外にデプロイする場合や、開発環境ごとPostgreSQLへ移行したい場合:

1. `prisma/schema.prisma` の `datasource db` を変更:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. `.env` の `DATABASE_URL` を PostgreSQL の接続文字列に変更(例: `postgresql://user:password@host:5432/dbname`)
3. 既存の `prisma/migrations/`(SQLite用SQL)は互換性がないため削除し、`npx prisma migrate dev --name init` でPostgreSQL用のマイグレーションを作り直す
4. SQLite固有の型は使用していないため、モデル定義自体の変更は不要

## 15. 実装済み機能(要件定義書との対応)

### 公開サイト
- トップページ(メインビジュアル/簡易検索/新着物件/特徴/エリアから探す/問い合わせ導線)
- 物件一覧(エリア・賃料上限・間取り・フリーワード検索、新着順/賃料順ソート、URLクエリ保持、0件時の案内表示)
- 物件詳細(写真ギャラリー、主要情報、初期費用内訳、物件概要、設備・条件、地図(緯度経度登録時)、備考・特約、広告情報、関連物件、問い合わせフォーム)
- 会社案内・お問い合わせ・プライバシーポリシー(すべて管理画面の会社情報設定から編集可能)
- スマートフォン下部固定の「電話する/問い合わせる」ボタン
- SEO: ページ別title/description/OGP/canonical、sitemap.xml、robots.txt、構造化データ(RealEstateAgent/Apartment/BreadcrumbList)、パンくずリスト、管理画面のnoindex

### 管理画面(要認証)
- ログイン/ログアウト(bcrypt + 署名付きセッションCookie、レート制限つき)
- ダッシュボード(募集中/申込あり/更新期限が近い/期限超過/未対応問い合わせの件数表示)
- 建物のCRUD(交通情報の複数登録、論理削除、写真管理)
- 募集住戸のCRUD(その他費用の複数登録、設備の複数選択、複製、募集状態変更、公開・非公開、公開前プレビュー、公開前入力チェック)
- 写真の複数アップロード・並び替え(ドラッグ&ドロップ)・メイン写真設定・キャプション/altテキスト編集
- 問い合わせ一覧・詳細・対応状況変更・管理メモ
- 更新期限一覧(期限超過・期限間近の強調表示、更新確認ボタン)
- 会社情報設定(次回更新予定日数、期限超過時の動作: 警告のみ/自動非公開)
- 設備マスター管理

### 問い合わせフォーム
- 必須項目(氏名/電話またはメール/希望連絡方法/個人情報同意)、サーバー側Zodバリデーション
- Next.js Server Actions の同一オリジンチェックによるCSRF対策
- ハニーポット・送信時間チェック・IPベースのレート制限によるスパム対策
- 直近30秒以内の同一内容送信を検知する二重送信防止
- 送信完了画面、エラー時のわかりやすい案内
- 物件詳細からの問い合わせは物件ID/建物名/部屋番号/管理番号/問い合わせ元URLを自動保存
- SMTP設定時の管理者向け通知メール(任意)

## 16. 未実装・今後の対応が必要な項目

- **更新期限超過の自動処理**: 現状は管理画面を開いたタイミングでの簡易評価。本番では定期実行ジョブ化を推奨(Vercelの場合はVercel Cronの利用を推奨。本書「19」参照)。
- **建物の「共用設備」**: 設備マスターとのM2M紐付けは行わず、自由記述欄(`commonFacilitiesNote`)として実装(設備マスターは住戸の「設備・条件」選択でのみ使用)。将来的に建物側も選択式にする場合はスキーマの `BuildingEquipment` を使ったUIの追加が必要(Prismaモデルは用意済み)。
- **問い合わせフォームのレート制限**: インメモリ実装のため単一インスタンス運用が前提。
- **写真のドラッグ&ドロップ**: ブラウザ標準のDrag and Drop APIのみで実装(タッチ操作でのドラッグ並び替えは非対応。スマートフォンでは削除→再アップロードでの並び替えを想定)。
- **住戸複製時の賃料・管理費**: 「要確認項目」として引き継ぎはするが、画面上での明示的な警告表示は行っていない(部屋番号・入居可能日・募集状態・公開日・更新日はリセットして再入力を促す設計)。
- **お気に入り・会員登録・LINE連携・オンライン入居申込・ポータルサイト連携**: 要件定義書の指示通り、今回は未実装(既存のデータ構造・Server Actions主体の設計は将来の機能追加を阻害しない想定)。
- **法令・公正競争規約への最終適合確認**: 広告に必要な項目の登録・表示は管理画面で可能な設計にしているが、表記内容自体の法的適合性は別途確認が必要。

## 17. 主な仮定(要件定義書に明記のない部分の判断)

- 「募集中のみ」一覧フィルタは実装していない。公開サイトの表示条件自体が「募集状態=募集中」を必須としているため(要件定義書セクション8)、常に募集中のみが表示される仕様と解釈した。
- 管理者アカウントはMVPでは単一ロール(スーパー管理者相当)のみとし、権限分けは実装していない。
- 「取引態様」は 媒介/代理/貸主 の3種類とした。
- 間取りは自由入力ではなく `LAYOUT_TYPES` のマスタ選択式とし、検索の一貫性を優先した。
- コーポレートカラーは仮の緑系(`--color-brand-*`、`src/app/globals.css`)とした。Tailwindのテーマ変数を書き換えるだけで全体に反映される。

## 18. ディレクトリ構成(抜粋)

```
prisma/                 スキーマ・マイグレーション・シード
src/app/(public)/       公開サイト(トップ/一覧/詳細/会社案内/問い合わせ/プライバシー)
src/app/admin/          管理画面((auth)=ログイン、(protected)=要認証画面)
src/components/         UIコンポーネント(layout/property/search/inquiry/admin/seo)
src/lib/                データ取得(data/)・バリデーション(validation/)・ドメインロジック・認証・ストレージ抽象化
tests/                  Vitest(unit/ 単体テスト、integration/ 実DBを使った統合テスト)
```

## 19. Vercelへのデプロイ手順

本プロジェクトは Vercel + Cloudflare R2(画像) + Prisma Postgres(Vercel Postgres) の構成を想定している。

### なぜスキーマファイルが2つあるのか

`prisma/schema.prisma`(SQLite・開発/テスト用)とは別に `prisma-postgres/schema.prisma`(PostgreSQL・本番用)を用意している。Prismaは1つのスキーマファイルにつき1つの`provider`しか持てないため、開発環境のSQLiteを維持したまま本番用にPostgreSQLへ切り替えるには、datasourceだけが異なる2つ目のスキーマが必要になる。

- `prisma-postgres/schema.prisma` は **自動生成ファイル(gitで管理しない)**。`prisma/schema.prisma` から `npm run db:generate:postgres-schema` で生成される(datasourceブロックのみ書き換え、モデル定義は共通)。モデルを変更する場合は必ず `prisma/schema.prisma` を編集すること。
- `prisma-postgres/migrations/` は本番DBのマイグレーション履歴なので **gitで管理する**(`prisma/migrations/` とは別の履歴)。

### 手順

1. **Cloudflare R2 を設定する**(本書「13」の手順でバケット・APIトークン・公開URLを準備)
2. **GitHubにpushし、Vercelでプロジェクトを作成**してから「Storage」タブで Prisma Postgres(または任意のPostgreSQL)を追加する。追加すると `DATABASE_URL` 等がプロジェクトの環境変数に自動追加される。
3. **その他の環境変数**を追加(Project Settings → Environment Variables。DATABASE_URL系はStorage追加時に自動設定済みなので不要):
   - `SESSION_SECRET`: 長いランダム文字列(`openssl rand -base64 32`)
   - `STORAGE_DRIVER`: `s3`
   - `S3_ENDPOINT` / `S3_REGION` / `S3_BUCKET` / `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` / `S3_PUBLIC_BASE_URL`: R2の値
   - `SITE_URL`: 本番ドメイン(例: `https://www.travelestate.jp`)
   - `SMTP_*` / `MAIL_FROM` / `MAIL_TO_ADMIN`: 問い合わせ通知メールを使う場合のみ
4. **Vercelの「Build Command」を `npm run vercel-build` に変更**する(Project Settings → Build & Development Settings)。このコマンドは以下を順に実行する:
   ```
   npm run db:generate:postgres-schema   # prisma-postgres/schema.prisma を生成
   prisma generate --schema=prisma-postgres/schema.prisma
   prisma migrate deploy --schema=prisma-postgres/schema.prisma
   next build
   ```
5. デプロイを実行する
6. 初回デプロイ後、本番用管理者アカウントを作成する(本書「11」)。ダミーのシードデータを投入したい場合は、ローカルから本番の `DATABASE_URL` を指定して `npx dotenv -e .env.production.local -- tsx prisma/seed.ts` のように実行できる(`.env.production.local` は `vercel env pull .env.production.local --environment=production` で取得)
7. **更新期限の自動非公開処理**: 本MVPでは管理画面アクセス時のみ評価される簡易実装のため、本番では [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) で `enforceOverdueAutoUnpublish()` を呼び出す軽量なAPI Route(例: `src/app/api/cron/overdue-check/route.ts`)を追加し、`vercel.json` で1日1回程度実行するよう設定することを推奨(現バージョンには未実装)。

### 本番用スキーマの動作確認について

`prisma-postgres/migrations/` のマイグレーションSQLは、実際のPostgreSQLに接続せず `prisma migrate diff --from-empty --to-schema-datamodel` で生成したものです(この開発環境にはPostgreSQL/Dockerが無く、実DBに対する動作確認ができていません)。生成されたSQLの内容は目視で確認済みですが、**初回デプロイ時にVercelのデプロイログでマイグレーションが正常に適用されたか必ず確認してください**。

### 注意点
- Vercelのファイルシステムは実行ごとにリセットされるため、`STORAGE_DRIVER=local` のまま本番運用すると画像がすぐに消える。必ず `s3` に設定すること。
- SQLite(`file:...`)はVercel上で永続化できないため、必ずPostgreSQLに切り替えること(本プロジェクトでは `prisma-postgres/schema.prisma` がその役割を担う)。
