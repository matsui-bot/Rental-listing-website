import { z } from "zod";

/**
 * 問い合わせフォームの入力検証(要件定義書 セクション12)。
 * サーバー側で必ずこのスキーマを通す(クライアント側のバリデーションだけに依存しない)。
 */
export const contactFormSchema = z
  .object({
    name: z.string().trim().min(1, "お名前を入力してください").max(100),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9()\-+ ]*$/, "電話番号の形式が正しくありません")
      .max(20)
      .optional()
      .or(z.literal("")),
    email: z.string().trim().email("メールアドレスの形式が正しくありません").max(200).optional().or(z.literal("")),
    preferredContactMethod: z.enum(["PHONE", "EMAIL"], {
      message: "希望する連絡方法を選択してください",
    }),
    // HTMLのチェックボックスはチェック時に value 属性の文字列("true")を送信し、
    // 未チェック時はキー自体が FormData に含まれない(ブール値の true/false にはならない)。
    agreeToPolicy: z.literal("true", {
      message: "個人情報の取り扱いに同意してください",
    }),
    preferredViewingDate: z.string().trim().max(100).optional().or(z.literal("")),
    desiredMoveInTime: z.string().trim().max(100).optional().or(z.literal("")),
    message: z.string().trim().max(2000).optional().or(z.literal("")),
    unitId: z.string().trim().optional().or(z.literal("")),
    sourceUrl: z.string().trim().max(500).optional().or(z.literal("")),
    // ハニーポット: ボットが埋めがちな非表示フィールド。値が入っていたら送信を拒否する。
    website: z.string().max(0, "不正な送信です").optional().or(z.literal("")),
    // 送信フォーム表示から一定時間経たないと拒否する簡易スパム対策用タイムスタンプ
    formRenderedAt: z.coerce.number().optional(),
  })
  .refine((data) => (data.phone && data.phone.length > 0) || (data.email && data.email.length > 0), {
    message: "電話番号またはメールアドレスのいずれかを入力してください",
    path: ["email"],
  });

export type ContactFormInput = z.infer<typeof contactFormSchema>;
