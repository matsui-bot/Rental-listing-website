import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getInquiryById } from "@/lib/data/admin-inquiries";
import { CONTACT_METHOD_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { InquiryControls } from "@/components/admin/InquiryControls";

export const metadata: Metadata = { title: "問い合わせ詳細" };

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getInquiryById(id);
  if (!inquiry) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">問い合わせ詳細</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 lg:col-span-2">
          <dl className="divide-y divide-neutral-100">
            {[
              ["受信日時", formatDate(inquiry.receivedAt)],
              ["建物名", inquiry.buildingName ?? "-"],
              ["部屋番号", inquiry.roomNumber ?? "-"],
              ["管理番号", inquiry.managementNumber ?? "-"],
              ["氏名", inquiry.name],
              ["電話番号", inquiry.phone ?? "-"],
              ["メールアドレス", inquiry.email ?? "-"],
              [
                "希望連絡方法",
                CONTACT_METHOD_LABEL[inquiry.preferredContactMethod as keyof typeof CONTACT_METHOD_LABEL] ??
                  inquiry.preferredContactMethod,
              ],
              ["内見希望日", inquiry.preferredViewingDate ?? "-"],
              ["入居希望時期", inquiry.desiredMoveInTime ?? "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
                <dt className="w-full shrink-0 text-sm text-neutral-500 sm:w-40">{label}</dt>
                <dd className="text-sm font-medium text-neutral-900">{value}</dd>
              </div>
            ))}
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
              <dt className="w-full shrink-0 text-sm text-neutral-500 sm:w-40">質問・要望</dt>
              <dd className="whitespace-pre-wrap text-sm font-medium text-neutral-900">{inquiry.message ?? "-"}</dd>
            </div>
            <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
              <dt className="w-full shrink-0 text-sm text-neutral-500 sm:w-40">問い合わせ元URL</dt>
              <dd className="break-all text-sm text-neutral-500">{inquiry.sourceUrl ?? "-"}</dd>
            </div>
          </dl>
          {inquiry.unitId && (
            <Link href={`/admin/units/${inquiry.unitId}`} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
              対象の住戸を編集画面で見る &rarr;
            </Link>
          )}
        </div>

        <InquiryControls inquiryId={inquiry.id} status={inquiry.status} adminMemo={inquiry.adminMemo} />
      </div>
    </div>
  );
}
