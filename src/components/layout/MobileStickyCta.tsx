import type { CompanyInfoData } from "@/lib/data/company";

/** スマートフォン画面下部に固定表示する「電話する/問い合わせる」バー */
export function MobileStickyCta({ company }: { company: CompanyInfoData }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden">
      <a
        href={`tel:${company.phone.replace(/[^0-9]/g, "")}`}
        className="tap-target flex flex-1 items-center justify-center gap-2 border-r border-neutral-200 py-3 text-base font-semibold text-brand-700"
      >
        <span aria-hidden>📞</span>電話する
      </a>
      <a
        href="/contact"
        className="tap-target flex flex-1 items-center justify-center gap-2 bg-brand-600 py-3 text-base font-semibold text-white"
      >
        <span aria-hidden>✉️</span>問い合わせる
      </a>
    </div>
  );
}
