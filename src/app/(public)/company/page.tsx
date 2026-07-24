import type { Metadata } from "next";
import { getCompanyInfo } from "@/lib/data/company";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "会社案内",
  description: "トラベルエステート株式会社の会社概要をご案内します。",
  alternates: { canonical: "/company" },
};

export default async function CompanyPage() {
  const company = await getCompanyInfo();

  return (
    <div>
      <Breadcrumbs items={[{ label: "トップ", href: "/" }, { label: "会社案内" }]} />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold text-neutral-900">会社案内</h1>

        {company.companyIntro && (
          <p className="mt-4 whitespace-pre-wrap text-neutral-700">{company.companyIntro}</p>
        )}

        <dl className="mt-8 divide-y divide-neutral-100 rounded-lg border border-neutral-200">
          {[
            ["会社名", company.name],
            ["所在地", `〒${company.postalCode} ${company.prefecture}${company.city}${company.addressLine}`],
            ["電話番号", company.phone],
            ["営業時間", company.businessHours],
            ["定休日", company.closedDays],
            ["宅建業免許番号", company.licenseNumber],
            ["所属団体", company.associations || "-"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
              <dt className="w-full shrink-0 text-sm text-neutral-500 sm:w-40">{label}</dt>
              <dd className="text-sm font-medium text-neutral-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
