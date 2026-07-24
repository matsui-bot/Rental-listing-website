import Link from "next/link";
import type { Metadata } from "next";
import { getCompanyInfo } from "@/lib/data/company";
import { getAvailableAreas, getNewArrivalUnits } from "@/lib/data/public-units";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySearchForm } from "@/components/search/PropertySearchForm";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: { absolute: "トラベルエステート株式会社｜賃貸物件情報" },
  description: "トラベルエステート株式会社が管理する賃貸物件の空室情報をご案内します。",
  alternates: { canonical: "/" },
};

const FEATURES = [
  { title: "自社管理物件だから安心", body: "仲介だけでなく自社で管理しているからこそ、募集状況や物件情報を正確にご案内します。" },
  { title: "わかりやすい料金表示", body: "賃料・管理費・初期費用の内訳をあらかじめ明記し、お問い合わせ後の認識違いを防ぎます。" },
  { title: "スマホでかんたん検索", body: "エリア・賃料・間取りからすぐに絞り込めるので、外出先でも物件探しができます。" },
];

export default async function TopPage() {
  const [company, newArrivals, areas] = await Promise.all([
    getCompanyInfo(),
    getNewArrivalUnits(6),
    getAvailableAreas(8),
  ]);

  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: company.name,
    url: siteUrl,
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      postalCode: company.postalCode,
      addressRegion: company.prefecture,
      addressLocality: company.city,
      streetAddress: company.addressLine,
    },
  };

  return (
    <div>
      <JsonLd data={organizationJsonLd} />
      <section className="bg-brand-700 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">{company.topCatchCopy}</h1>
          <p className="mt-3 text-brand-100">{company.topSubCopy}</p>
          <Link
            href="/properties"
            className="tap-target mt-6 inline-block rounded-md bg-white px-6 py-3 font-semibold text-brand-700"
          >
            募集中の物件を見る
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">かんたん物件検索</h2>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
          <PropertySearchForm initial={{}} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">新着物件</h2>
          <Link href="/properties" className="text-sm font-medium text-brand-700 hover:underline">
            すべて見る &rarr;
          </Link>
        </div>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newArrivals.map((unit) => (
              <PropertyCard key={unit.id} unit={unit} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
            現在公開中の新着物件はありません。近日中に更新予定ですので、しばらくお待ちください。
          </p>
        )}
      </section>

      <section className="bg-neutral-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-6 text-lg font-bold text-neutral-900">
            {company.logoText}の特徴
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg bg-white p-5 shadow-sm">
                <p className="font-bold text-brand-700">{f.title}</p>
                <p className="mt-2 text-sm text-neutral-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">エリアから探す</h2>
          <div className="flex flex-wrap gap-2">
            {areas.map(({ area, count }) => (
              <Link
                key={area}
                href={`/properties?area=${encodeURIComponent(area)}`}
                className="tap-target rounded-full border border-neutral-300 px-4 py-2 text-sm hover:border-brand-500 hover:text-brand-700"
              >
                {area}({count}件)
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-brand-50 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-lg font-bold text-neutral-900">お気軽にお問い合わせください</h2>
          <p className="mt-2 text-neutral-600">
            気になる物件がございましたら、お電話またはフォームからお問い合わせください。
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`tel:${company.phone.replace(/[^0-9]/g, "")}`}
              className="tap-target rounded-md border border-brand-600 px-6 py-3 font-semibold text-brand-700"
            >
              📞 {company.phone}
            </a>
            <Link
              href="/contact"
              className="tap-target rounded-md bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
            >
              お問い合わせフォームへ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
