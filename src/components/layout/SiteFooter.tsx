import Link from "next/link";
import type { CompanyInfoData } from "@/lib/data/company";

export function SiteFooter({ company }: { company: CompanyInfoData }) {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 pb-24 pt-10 text-sm text-neutral-700 md:pb-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-base font-bold text-neutral-900">{company.name}</p>
        <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="shrink-0 text-neutral-500">所在地</dt>
            <dd>
              〒{company.postalCode} {company.prefecture}{company.city}{company.addressLine}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-neutral-500">電話番号</dt>
            <dd>{company.phone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-neutral-500">営業時間</dt>
            <dd>{company.businessHours}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-neutral-500">定休日</dt>
            <dd>{company.closedDays}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="shrink-0 text-neutral-500">宅建業免許番号</dt>
            <dd>{company.licenseNumber}</dd>
          </div>
          {company.associations && (
            <div className="flex gap-2">
              <dt className="shrink-0 text-neutral-500">所属団体</dt>
              <dd>{company.associations}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-200 pt-4 text-neutral-600">
          <Link href="/properties" className="hover:text-brand-600">物件を探す</Link>
          <Link href="/company" className="hover:text-brand-600">会社案内</Link>
          <Link href="/contact" className="hover:text-brand-600">お問い合わせ</Link>
          <Link href="/privacy" className="hover:text-brand-600">プライバシーポリシー</Link>
        </div>

        <p className="mt-6 text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} {company.name}
        </p>
      </div>
    </footer>
  );
}
