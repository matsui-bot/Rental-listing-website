import Link from "next/link";
import type { CompanyInfoData } from "@/lib/data/company";
import { MobileNavToggle } from "./MobileNavToggle";

const NAV_LINKS = [
  { href: "/properties", label: "物件を探す" },
  { href: "/company", label: "会社案内" },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteHeader({ company }: { company: CompanyInfoData }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 text-lg font-bold text-brand-700">
          {company.logoText}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={`tel:${company.phone.replace(/[^0-9]/g, "")}`}
            className="flex items-center gap-2 text-sm font-semibold text-brand-700"
          >
            <span aria-hidden>📞</span>
            {company.phone}
          </a>
          <Link
            href="/contact"
            className="tap-target rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            お問い合わせ
          </Link>
        </div>

        <MobileNavToggle navLinks={NAV_LINKS} phone={company.phone} />
      </div>
    </header>
  );
}
