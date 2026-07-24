import type { Metadata } from "next";
import Link from "next/link";
import { searchPublicUnits, type UnitSortOrder } from "@/lib/data/public-units";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySearchForm } from "@/components/search/PropertySearchForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "物件一覧",
  description: "トラベルエステート株式会社が管理する募集中の賃貸物件一覧です。",
  alternates: { canonical: "/properties" },
};

interface PageProps {
  searchParams: Promise<{
    area?: string;
    maxRent?: string;
    layoutType?: string;
    keyword?: string;
    sort?: string;
    page?: string;
  }>;
}

const VALID_SORTS: UnitSortOrder[] = ["newest", "rent_asc", "rent_desc"];

export default async function PropertyListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort: UnitSortOrder = VALID_SORTS.includes(params.sort as UnitSortOrder)
    ? (params.sort as UnitSortOrder)
    : "newest";
  const page = Math.max(Number(params.page) || 1, 1);
  const maxRent = params.maxRent ? Number(params.maxRent) : undefined;

  const { items, total, totalPages } = await searchPublicUnits({
    area: params.area,
    maxRent: Number.isFinite(maxRent) ? maxRent : undefined,
    layoutType: params.layoutType,
    keyword: params.keyword,
    sort,
    page,
    pageSize: 12,
  });

  const hasFilters = Boolean(params.area || params.maxRent || params.layoutType || params.keyword);

  return (
    <div>
      <Breadcrumbs items={[{ label: "トップ", href: "/" }, { label: "物件一覧" }]} />
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-bold text-neutral-900">物件一覧</h1>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <PropertySearchForm
          initial={{
            area: params.area,
            maxRent: params.maxRent,
            layoutType: params.layoutType,
            keyword: params.keyword,
            sort,
          }}
          showSort
        />
      </div>

      <p className="mt-6 text-sm text-neutral-500">{total}件の募集中物件が見つかりました</p>

      {items.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((unit) => (
              <PropertyCard key={unit.id} unit={unit} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-2" aria-label="ページネーション">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const search = new URLSearchParams();
                if (params.area) search.set("area", params.area);
                if (params.maxRent) search.set("maxRent", params.maxRent);
                if (params.layoutType) search.set("layoutType", params.layoutType);
                if (params.keyword) search.set("keyword", params.keyword);
                search.set("sort", sort);
                search.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/properties?${search.toString()}`}
                    className={`tap-target flex items-center justify-center rounded-md border px-3 ${
                      p === page
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-neutral-300 text-neutral-700"
                    }`}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}
        </>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-10 text-center">
          <p className="font-semibold text-neutral-700">
            {hasFilters
              ? "条件に合う物件が見つかりませんでした。"
              : "現在公開中の物件がありません。"}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            エリアや賃料上限などの条件を変更して、もう一度お試しください。
          </p>
          <Link
            href="/properties"
            className="tap-target mt-4 inline-block rounded-md border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700"
          >
            条件をリセットする
          </Link>
        </div>
      )}
    </div>
    </div>
  );
}
