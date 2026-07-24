import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicUnitById, getRelatedUnits } from "@/lib/data/public-units";
import { getCompanyInfo } from "@/lib/data/company";
import { formatArea, formatRentManYen } from "@/lib/format";
import { PropertyDetailView } from "@/components/property/PropertyDetailView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const unit = await getPublicUnitById(id);
  if (!unit) return { title: "物件が見つかりません" };

  const title = `${unit.building.name} ${unit.roomNumber}｜賃貸物件`;
  const description = `${unit.building.name} ${unit.roomNumber} / 賃料${formatRentManYen(unit.rent)} / ${unit.layoutType} / ${formatArea(unit.exclusiveArea)}。${unit.catchCopy ?? ""}`.trim();
  const mainPhoto = unit.photos.find((p) => p.isMain) ?? unit.photos[0];

  return {
    title,
    description,
    alternates: { canonical: `/properties/${unit.id}` },
    openGraph: {
      title,
      description,
      images: mainPhoto ? [{ url: mainPhoto.url }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [unit, company] = await Promise.all([getPublicUnitById(id), getCompanyInfo()]);
  if (!unit) notFound();

  const related = await getRelatedUnits(unit.buildingId, unit.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: `${unit.building.name} ${unit.roomNumber}`,
    numberOfRooms: unit.layoutType,
    floorSize: { "@type": "QuantitativeValue", value: unit.exclusiveArea, unitCode: "MTK" },
    address: {
      "@type": "PostalAddress",
      addressRegion: unit.building.prefecture,
      addressLocality: unit.building.city,
      streetAddress: unit.building.addressDisclosureLevel === "FULL" ? unit.building.addressLine : undefined,
    },
    offers: {
      "@type": "Offer",
      price: unit.rent,
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "トップ", href: "/" },
          { label: "物件一覧", href: "/properties" },
          { label: `${unit.building.name} ${unit.roomNumber}` },
        ]}
      />
      <JsonLd data={jsonLd} />
      <PropertyDetailView unit={unit} company={company} related={related} />
    </div>
  );
}
