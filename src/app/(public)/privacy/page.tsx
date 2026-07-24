import type { Metadata } from "next";
import { getCompanyInfo } from "@/lib/data/company";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "トラベルエステート株式会社の個人情報の取り扱いについて。",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const company = await getCompanyInfo();

  return (
    <div>
      <Breadcrumbs items={[{ label: "トップ", href: "/" }, { label: "プライバシーポリシー" }]} />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-xl font-bold text-neutral-900">プライバシーポリシー</h1>
        <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
          {company.privacyPolicyBody || "プライバシーポリシーは準備中です。"}
        </div>
      </div>
    </div>
  );
}
