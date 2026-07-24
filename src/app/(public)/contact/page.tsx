import type { Metadata } from "next";
import { getCompanyInfo } from "@/lib/data/company";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { InquiryForm } from "@/components/inquiry/InquiryForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "トラベルエステート株式会社へのお問い合わせはこちらから。",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const company = await getCompanyInfo();

  return (
    <div>
      <Breadcrumbs items={[{ label: "トップ", href: "/" }, { label: "お問い合わせ" }]} />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-bold text-neutral-900">お問い合わせ</h1>
        <p className="mt-2 text-sm text-neutral-600">
          お電話でのお問い合わせは
          <a href={`tel:${company.phone.replace(/[^0-9]/g, "")}`} className="mx-1 font-semibold text-brand-700">
            {company.phone}
          </a>
          ({company.businessHours}・{company.closedDays}を除く)まで。フォームからのお問い合わせは以下より承ります。
        </p>

        <div className="mt-6 rounded-lg border border-neutral-200 p-5 sm:p-8">
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}
