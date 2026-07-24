import "server-only";

/**
 * 管理者への問い合わせ通知メール送信。
 * SMTP_HOST が未設定の場合は何もしない(問い合わせはDB保存のみで完結する)。
 * 送信失敗は呼び出し元の成功レスポンスに影響させない(ベストエフォート)。
 */
export interface InquiryNotificationPayload {
  buildingName?: string | null;
  roomNumber?: string | null;
  managementNumber?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  preferredContactMethod: string;
  message?: string | null;
}

export async function sendInquiryNotificationMail(payload: InquiryNotificationPayload): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, MAIL_TO_ADMIN } = process.env;
  if (!SMTP_HOST || !MAIL_TO_ADMIN) {
    return; // メール送信環境が未設定のため何もしない
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: Number(SMTP_PORT) === 465,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });

    const subject = `【問い合わせ】${payload.buildingName ?? ""} ${payload.roomNumber ?? ""}`.trim();
    const body = [
      `建物名: ${payload.buildingName ?? "-"}`,
      `部屋番号: ${payload.roomNumber ?? "-"}`,
      `管理番号: ${payload.managementNumber ?? "-"}`,
      `氏名: ${payload.name}`,
      `電話番号: ${payload.phone ?? "-"}`,
      `メールアドレス: ${payload.email ?? "-"}`,
      `希望連絡方法: ${payload.preferredContactMethod === "PHONE" ? "電話" : "メール"}`,
      "",
      "質問・要望:",
      payload.message ?? "(なし)",
    ].join("\n");

    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: MAIL_TO_ADMIN,
      subject,
      text: body,
    });
  } catch (error) {
    console.error("問い合わせ通知メールの送信に失敗しました", error);
  }
}
