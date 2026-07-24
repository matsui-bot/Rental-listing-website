import Link from "next/link";
import type { Metadata } from "next";
import { listInquiries } from "@/lib/data/admin-inquiries";
import { INQUIRY_STATUS, INQUIRY_STATUS_LABEL, CONTACT_METHOD_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "問い合わせ一覧" };

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const inquiries = await listInquiries(status);

  return (
    <div>
      <h1 className="text-xl font-bold text-neutral-900">問い合わせ一覧</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href="/admin/inquiries" className={`rounded-full border px-3 py-1.5 ${!status ? "border-brand-600 text-brand-700" : "border-neutral-300"}`}>
          すべて
        </Link>
        {Object.values(INQUIRY_STATUS).map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            className={`rounded-full border px-3 py-1.5 ${status === s ? "border-brand-600 text-brand-700" : "border-neutral-300"}`}
          >
            {INQUIRY_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">受信日時</th>
              <th className="px-4 py-3">物件</th>
              <th className="px-4 py-3">氏名</th>
              <th className="px-4 py-3">連絡方法</th>
              <th className="px-4 py-3">対応状況</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className={`border-b border-neutral-100 last:border-0 ${inq.status === "NEW" ? "bg-amber-50/60" : ""}`}>
                <td className="px-4 py-3 text-neutral-600">{formatDate(inq.receivedAt)}</td>
                <td className="px-4 py-3">
                  {inq.buildingName ?? "-"} {inq.roomNumber ?? ""}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">{inq.name}</td>
                <td className="px-4 py-3">
                  {CONTACT_METHOD_LABEL[inq.preferredContactMethod as keyof typeof CONTACT_METHOD_LABEL] ?? inq.preferredContactMethod}
                </td>
                <td className="px-4 py-3">
                  <span className={inq.status === "NEW" ? "font-semibold text-amber-700" : "text-neutral-600"}>
                    {INQUIRY_STATUS_LABEL[inq.status as keyof typeof INQUIRY_STATUS_LABEL] ?? inq.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/inquiries/${inq.id}`} className="text-brand-700 hover:underline">
                    詳細
                  </Link>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  該当する問い合わせがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
