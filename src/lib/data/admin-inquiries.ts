import "server-only";
import { prisma } from "@/lib/prisma";

export async function listInquiries(status?: string) {
  return prisma.inquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ receivedAt: "desc" }],
  });
}

export async function getInquiryById(id: string) {
  return prisma.inquiry.findUnique({
    where: { id },
    include: { unit: { include: { building: true } } },
  });
}
