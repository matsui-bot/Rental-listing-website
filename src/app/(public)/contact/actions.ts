"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validation/inquiry";
import { isRateLimited } from "@/lib/rate-limit";
import { sendInquiryNotificationMail } from "@/lib/mail";

export interface InquiryActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

const DUPLICATE_WINDOW_MS = 30 * 1000;
const MIN_FILL_TIME_MS = 1500;

export async function submitInquiry(
  _prevState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "入力内容をご確認ください。",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;

  // 簡易スパム対策: フォーム表示直後(1.5秒未満)の送信は拒否
  if (data.formRenderedAt && Date.now() - data.formRenderedAt < MIN_FILL_TIME_MS) {
    return { status: "error", message: "しばらく時間をおいてから再度お試しください。" };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  if (isRateLimited(ip)) {
    return {
      status: "error",
      message: "送信回数が多すぎます。しばらく時間をおいてから再度お試しください。",
    };
  }

  // 二重送信防止: 同一連絡先・同一物件への直近の送信があれば新規作成せず成功扱いにする
  const duplicateWindowStart = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const existing = await prisma.inquiry.findFirst({
    where: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      unitId: data.unitId || null,
      createdAt: { gte: duplicateWindowStart },
    },
  });
  if (existing) {
    return { status: "success", message: "お問い合わせを受け付けました。" };
  }

  let buildingName: string | null = null;
  let roomNumber: string | null = null;
  let managementNumber: string | null = null;

  if (data.unitId) {
    const unit = await prisma.unit.findUnique({
      where: { id: data.unitId },
      include: { building: true },
    });
    if (unit) {
      buildingName = unit.building.name;
      roomNumber = unit.roomNumber;
      managementNumber = unit.managementNumber;
    }
  }

  await prisma.inquiry.create({
    data: {
      unitId: data.unitId || null,
      buildingName,
      roomNumber,
      managementNumber,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      preferredContactMethod: data.preferredContactMethod,
      preferredViewingDate: data.preferredViewingDate || null,
      desiredMoveInTime: data.desiredMoveInTime || null,
      message: data.message || null,
      sourceUrl: data.sourceUrl || null,
      status: "NEW",
    },
  });

  await sendInquiryNotificationMail({
    buildingName,
    roomNumber,
    managementNumber,
    name: data.name,
    phone: data.phone,
    email: data.email,
    preferredContactMethod: data.preferredContactMethod,
    message: data.message,
  });

  return { status: "success", message: "お問い合わせを受け付けました。" };
}
