import Image from "next/image";
import Link from "next/link";
import type { PublicUnitCard } from "@/lib/data/public-units";
import { formatRentManYen, formatYen, formatArea, formatWalkMinutes, splitTags } from "@/lib/format";

export function PropertyCard({ unit }: { unit: PublicUnitCard }) {
  const mainPhoto = unit.photos.find((p) => p.isMain) ?? unit.photos[0];
  const station = unit.building.stations[0];
  const tags = splitTags(unit.featureTags).slice(0, 3);
  const feeLabel = unit.managementFee
    ? `管理費${formatYen(unit.managementFee)}`
    : unit.commonServiceFee
      ? `共益費${formatYen(unit.commonServiceFee)}`
      : "管理費・共益費なし";

  return (
    <Link
      href={`/properties/${unit.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {mainPhoto ? (
          <Image
            src={mainPhoto.url}
            alt={mainPhoto.altText || `${unit.building.name} ${unit.roomNumber}`}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">画像準備中</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-sm font-semibold text-neutral-900">
          {unit.building.name} {unit.roomNumber}
        </p>
        <p className="text-2xl font-bold text-brand-700">
          {formatRentManYen(unit.rent)}
          <span className="ml-2 text-xs font-normal text-neutral-500">{feeLabel}</span>
        </p>
        <p className="text-sm text-neutral-700">
          {unit.layoutType} / {formatArea(unit.exclusiveArea)}
        </p>
        {station && (
          <p className="text-sm text-neutral-500">
            {station.lineName} {station.stationName} {formatWalkMinutes(station.walkMinutes)}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
