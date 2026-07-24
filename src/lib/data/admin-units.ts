import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_UPCOMING_THRESHOLD_DAYS } from "@/lib/update-schedule";

export async function getDashboardStats() {
  const now = new Date();
  const upcomingLimit = new Date(now.getTime() + DEFAULT_UPCOMING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const [recruitingCount, applicationReceivedCount, upcomingCount, overdueCount, pendingInquiryCount] =
    await Promise.all([
      prisma.unit.count({ where: { isDeleted: false, recruitingStatus: "RECRUITING" } }),
      prisma.unit.count({ where: { isDeleted: false, recruitingStatus: "APPLICATION_RECEIVED" } }),
      prisma.unit.count({
        where: {
          isDeleted: false,
          nextUpdateDueAt: { gte: now, lte: upcomingLimit },
          recruitingStatus: { in: ["RECRUITING", "APPLICATION_RECEIVED", "UPDATE_PENDING"] },
        },
      }),
      prisma.unit.count({
        where: {
          isDeleted: false,
          nextUpdateDueAt: { lt: now },
          recruitingStatus: { in: ["RECRUITING", "APPLICATION_RECEIVED", "UPDATE_PENDING"] },
        },
      }),
      prisma.inquiry.count({ where: { status: "NEW" } }),
    ]);

  return {
    recruitingCount,
    applicationReceivedCount,
    upcomingCount,
    overdueCount,
    pendingInquiryCount,
  };
}

export const adminUnitListInclude = {
  building: true,
  photos: { where: { isMain: true }, take: 1 },
} as const;

export async function listUnitsForAdmin() {
  return prisma.unit.findMany({
    where: { isDeleted: false },
    include: adminUnitListInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function listUnitsWithUpdateSchedule() {
  return prisma.unit.findMany({
    where: { isDeleted: false, publicationStatus: "PUBLISHED" },
    include: { building: true },
    orderBy: [{ nextUpdateDueAt: "asc" }],
  });
}

export async function listBuildingsForAdmin() {
  return prisma.building.findMany({
    where: { isDeleted: false },
    include: { _count: { select: { units: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function listBuildingOptions() {
  return prisma.building.findMany({
    where: { isDeleted: false },
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }],
  });
}

export async function listEquipmentMaster() {
  return prisma.equipmentMaster.findMany({ orderBy: [{ order: "asc" }] });
}

export const unitEditInclude = {
  building: { include: { stations: true } },
  photos: { orderBy: { order: "asc" as const } },
  otherCosts: { orderBy: { order: "asc" as const } },
  equipment: { include: { equipment: true } },
} satisfies Parameters<typeof prisma.unit.findUnique>[0]["include"];

export async function getUnitForEdit(id: string) {
  return prisma.unit.findUnique({
    where: { id, isDeleted: false },
    include: unitEditInclude,
  });
}
