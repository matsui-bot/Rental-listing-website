import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * 更新期限超過時の自動処理(要件定義書 セクション10「期限超過時の動作」)。
 * 会社設定が「自動的に非公開」の場合、期限超過している公開中住戸を非公開 + 更新確認待ちにする。
 *
 * 本来は定期実行ジョブ(cronなど)で行うべき処理だが、MVPではスケジューラを持たないため、
 * 管理画面のダッシュボード/更新期限一覧を開いたタイミングで簡易的に評価する(README に制限を明記)。
 */
export async function enforceOverdueAutoUnpublish(): Promise<number> {
  const company = await prisma.companyInfo.findUnique({ where: { id: "singleton" } });
  if (!company || company.overdueAction !== "AUTO_UNPUBLISH") return 0;

  const result = await prisma.unit.updateMany({
    where: {
      isDeleted: false,
      publicationStatus: "PUBLISHED",
      nextUpdateDueAt: { lt: new Date() },
      recruitingStatus: { in: ["RECRUITING", "APPLICATION_RECEIVED"] },
    },
    data: {
      publicationStatus: "UNPUBLISHED",
      recruitingStatus: "UPDATE_PENDING",
    },
  });
  return result.count;
}
