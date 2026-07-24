import type { PublicUnitDetail } from "@/lib/data/public-units";
import type { CompanyInfoData } from "@/lib/data/company";
import { formatArea, formatRentManYen, formatWalkMinutes, formatYen } from "@/lib/format";
import { PhotoGallery } from "@/components/property/PhotoGallery";
import {
  InitialCostTable,
  OverviewTable,
  EquipmentTags,
  AdInfoTable,
  FeatureTagList,
} from "@/components/property/PropertyDetailTables";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { PublicUnitCard } from "@/lib/data/public-units";

/** 物件詳細ページの表示部分。公開サイトの詳細ページと、管理画面のプレビューで共有する。 */
export function PropertyDetailView({
  unit,
  company,
  related,
  previewBanner,
}: {
  unit: PublicUnitDetail;
  company: CompanyInfoData;
  related: PublicUnitCard[];
  previewBanner?: React.ReactNode;
}) {
  const station = unit.building.stations[0];
  const feeLabel = unit.managementFee
    ? { label: "管理費", value: unit.managementFee }
    : unit.commonServiceFee
      ? { label: "共益費", value: unit.commonServiceFee }
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {previewBanner}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PhotoGallery
            photos={unit.photos.map((p) => ({
              id: p.id,
              url: p.url,
              thumbnailUrl: p.thumbnailUrl,
              category: p.category,
              caption: p.caption,
              altText: p.altText,
            }))}
            title={`${unit.building.name} ${unit.roomNumber}`}
          />
        </div>

        <div className="rounded-lg border border-neutral-200 p-5">
          <h1 className="text-lg font-bold text-neutral-900">
            {unit.building.name} {unit.roomNumber}
          </h1>
          {unit.catchCopy && <p className="mt-1 text-sm text-brand-700">{unit.catchCopy}</p>}

          <p className="mt-4 text-3xl font-bold text-brand-700">{formatRentManYen(unit.rent)}</p>
          {feeLabel && (
            <p className="text-sm text-neutral-500">
              {feeLabel.label} {formatYen(feeLabel.value)}
            </p>
          )}

          <dl className="mt-4 space-y-1.5 text-sm text-neutral-700">
            <div className="flex justify-between">
              <dt className="text-neutral-500">間取り</dt>
              <dd>{unit.layoutType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">専有面積</dt>
              <dd>{formatArea(unit.exclusiveArea)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">敷金 / 礼金</dt>
              <dd>
                {formatYen(unit.deposit)} / {formatYen(unit.keyMoney)}
              </dd>
            </div>
            {station && (
              <div className="flex justify-between">
                <dt className="text-neutral-500">最寄り駅</dt>
                <dd>
                  {station.lineName} {station.stationName} {formatWalkMinutes(station.walkMinutes)}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-500">入居可能時期</dt>
              <dd>{unit.availableDate || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">現況</dt>
              <dd>{unit.currentStatus || "-"}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <FeatureTagList tags={unit.featureTags} />
          </div>

          <a
            href="#inquiry"
            className="tap-target mt-6 block rounded-md bg-brand-600 py-3 text-center font-bold text-white hover:bg-brand-700"
          >
            内見・お問い合わせはこちら
          </a>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">初期費用・契約条件</h2>
        <InitialCostTable unit={unit} />
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">物件概要</h2>
        <OverviewTable unit={unit} />
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">設備・条件</h2>
        <EquipmentTags unit={unit} />
      </section>

      {unit.building.latitude && unit.building.longitude && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold text-neutral-900">地図</h2>
          <div className="aspect-video w-full overflow-hidden rounded-lg border border-neutral-200">
            <iframe
              title="物件所在地の地図"
              className="h-full w-full"
              loading="lazy"
              src={`https://www.google.com/maps?q=${unit.building.latitude},${unit.building.longitude}&output=embed`}
            />
          </div>
        </section>
      )}

      {(unit.remarks || unit.specialTerms) && (
        <section className="mt-12 space-y-4">
          {unit.remarks && (
            <div>
              <h2 className="mb-2 text-lg font-bold text-neutral-900">備考</h2>
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{unit.remarks}</p>
            </div>
          )}
          {unit.specialTerms && (
            <div>
              <h2 className="mb-2 text-lg font-bold text-neutral-900">特約</h2>
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{unit.specialTerms}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-3 text-lg font-bold text-neutral-900">広告情報</h2>
        <AdInfoTable unit={unit} company={company} />
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold text-neutral-900">同じ建物の関連物件</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PropertyCard key={r.id} unit={r} />
            ))}
          </div>
        </section>
      )}

      <section id="inquiry" className="mt-12 scroll-mt-20 rounded-lg border border-neutral-200 p-5 sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">内見・お問い合わせ</h2>
        <InquiryForm context={{ unitId: unit.id, buildingName: unit.building.name, roomNumber: unit.roomNumber }} />
      </section>
    </div>
  );
}
