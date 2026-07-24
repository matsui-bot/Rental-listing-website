-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "company_info" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "name" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "businessHours" TEXT NOT NULL,
    "closedDays" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "associations" TEXT NOT NULL,
    "logoText" TEXT NOT NULL DEFAULT 'トラベルエステート株式会社',
    "logoUrl" TEXT,
    "topCatchCopy" TEXT NOT NULL DEFAULT '自社管理物件を、わかりやすく、探しやすく。',
    "topSubCopy" TEXT NOT NULL DEFAULT 'トラベルエステート株式会社の募集中物件をご案内します。',
    "companyIntro" TEXT NOT NULL DEFAULT '',
    "privacyPolicyBody" TEXT NOT NULL DEFAULT '',
    "updateIntervalDays" INTEGER NOT NULL DEFAULT 14,
    "overdueAction" TEXT NOT NULL DEFAULT 'WARN_ONLY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "postalCode" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "addressLine2" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "addressDisclosureLevel" TEXT NOT NULL DEFAULT 'FULL',
    "structure" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL,
    "totalUnits" INTEGER,
    "builtYearMonth" TEXT NOT NULL,
    "busInfo" TEXT,
    "parkingInfo" TEXT,
    "surroundingInfo" TEXT,
    "commonFacilitiesNote" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "building_stations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "walkMinutes" INTEGER,
    "busMinutes" INTEGER,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "building_stations_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "managementNumber" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER,
    "layoutType" TEXT NOT NULL,
    "exclusiveArea" REAL NOT NULL,
    "direction" TEXT,
    "rent" INTEGER NOT NULL,
    "managementFee" INTEGER,
    "commonServiceFee" INTEGER,
    "deposit" INTEGER,
    "keyMoney" INTEGER,
    "guaranteeDeposit" INTEGER,
    "amortization" INTEGER,
    "guarantorCompanyFee" INTEGER,
    "fireInsuranceFee" INTEGER,
    "keyExchangeFee" INTEGER,
    "cleaningFee" INTEGER,
    "renewalFee" INTEGER,
    "contractPeriod" TEXT,
    "contractType" TEXT,
    "availableDate" TEXT,
    "currentStatus" TEXT,
    "recruitingConditions" TEXT,
    "catchCopy" TEXT,
    "remarks" TEXT,
    "specialTerms" TEXT,
    "transactionType" TEXT,
    "featureTags" TEXT,
    "recruitingStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "publicationStatus" TEXT NOT NULL DEFAULT 'UNPUBLISHED',
    "publishStartAt" DATETIME,
    "publishEndAt" DATETIME,
    "publishedAt" DATETIME,
    "lastUpdatedAt" DATETIME,
    "nextUpdateDueAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "units_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "other_costs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "taxType" TEXT NOT NULL DEFAULT 'INCLUDED',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "other_costs_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetType" TEXT NOT NULL,
    "buildingId" TEXT,
    "unitId" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT NOT NULL,
    "caption" TEXT,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "photos_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "photos_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipment_master" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "building_equipment" (
    "buildingId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    PRIMARY KEY ("buildingId", "equipmentId"),
    CONSTRAINT "building_equipment_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "building_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment_master" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "unit_equipment" (
    "unitId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    PRIMARY KEY ("unitId", "equipmentId"),
    CONSTRAINT "unit_equipment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "unit_equipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment_master" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT,
    "buildingName" TEXT,
    "roomNumber" TEXT,
    "managementNumber" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "preferredContactMethod" TEXT NOT NULL,
    "preferredViewingDate" TEXT,
    "desiredMoveInTime" TEXT,
    "message" TEXT,
    "sourceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminMemo" TEXT,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inquiries_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "building_stations_buildingId_idx" ON "building_stations"("buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "units_managementNumber_key" ON "units"("managementNumber");

-- CreateIndex
CREATE INDEX "units_buildingId_idx" ON "units"("buildingId");

-- CreateIndex
CREATE INDEX "other_costs_unitId_idx" ON "other_costs"("unitId");

-- CreateIndex
CREATE INDEX "photos_buildingId_idx" ON "photos"("buildingId");

-- CreateIndex
CREATE INDEX "photos_unitId_idx" ON "photos"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_master_name_key" ON "equipment_master"("name");

-- CreateIndex
CREATE INDEX "inquiries_unitId_idx" ON "inquiries"("unitId");
