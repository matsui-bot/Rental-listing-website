import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getUnitDetailForPreview, getRelatedUnits } from "@/lib/data/public-units";
import { getCompanyInfo } from "@/lib/data/company";
import { PropertyDetailView } from "@/components/property/PropertyDetailView";

export const metadata: Metadata = { title: "公開プレビュー" };

export default async function UnitPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [unit, company] = await Promise.all([getUnitDetailForPreview(id), getCompanyInfo()]);
  if (!unit) notFound();

  const related = await getRelatedUnits(unit.buildingId, unit.id);
  const isPubliclyVisible = unit.publicationStatus === "PUBLISHED" && unit.recruitingStatus === "RECRUITING";

  return (
    <div className="bg-white">
      <PropertyDetailView
        unit={unit}
        company={company}
        related={related}
        previewBanner={
          <div className="mb-4 flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
            <span>
              これは管理画面からのプレビューです。
              {isPubliclyVisible
                ? "現在この住戸は公開サイトにも表示されています。"
                : "現在この住戸は公開サイトには表示されていません。"}
            </span>
            <Link href={`/admin/units/${unit.id}`} className="font-semibold underline">
              編集画面に戻る
            </Link>
          </div>
        }
      />
    </div>
  );
}
