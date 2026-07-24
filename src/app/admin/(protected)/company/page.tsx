import type { Metadata } from "next";
import { getCompanyInfo } from "@/lib/data/company";
import { CompanyForm } from "@/components/admin/CompanyForm";

export const metadata: Metadata = { title: "会社情報設定" };

export default async function AdminCompanyPage() {
  const company = await getCompanyInfo();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">会社情報設定</h1>
      <p className="mt-1 text-sm text-neutral-500">
        ここで編集した内容は公開サイトのヘッダー・フッター・会社案内ページ・プライバシーポリシーページに反映されます。
      </p>
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
