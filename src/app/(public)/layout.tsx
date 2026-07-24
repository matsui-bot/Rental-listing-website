import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { getCompanyInfo } from "@/lib/data/company";

// 募集状態・公開状態・会社情報の変更を即座に反映するため、公開サイト全体を静的キャッシュせず動的レンダリングする
// (このセグメント設定は配下のページ全体に継承される)
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompanyInfo();

  return (
    <>
      <SiteHeader company={company} />
      <main className="flex-1">{children}</main>
      <SiteFooter company={company} />
      <MobileStickyCta company={company} />
    </>
  );
}
