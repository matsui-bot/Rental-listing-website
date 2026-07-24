import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { publicUnitWhereClause } from "@/lib/data/public-units";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  const units = await prisma.unit.findMany({
    where: publicUnitWhereClause(),
    select: { id: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/company`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const unitPages: MetadataRoute.Sitemap = units.map((unit) => ({
    url: `${siteUrl}/properties/${unit.id}`,
    lastModified: unit.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...unitPages];
}
