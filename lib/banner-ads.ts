import fs from "node:fs";
import path from "node:path";

const XLSX: typeof import("xlsx") = require("xlsx");

export type BannerAd = {
  page: number;
  slot: 1 | 2;
  image: string;
  url: string | null;
  alt: string;
};

export function getBannerAds(): BannerAd[] {
  const directory = path.join(process.cwd(), "public", "banner-ads");
  const file = path.join(directory, "banners.xlsx");
  if (!fs.existsSync(file)) return [];

  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets.banners;
  if (!sheet) return [];

  const ads: BannerAd[] = [];
  for (const original of XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })) {
    const row = Object.fromEntries(Object.entries(original).map(([key, value]) => [key.trim().toLowerCase(), String(value).trim()]));
    const page = Number(row.page || 1);
    const slot = Number(row.slot);
    if (!Number.isSafeInteger(page) || page < 1) continue;
    if ((slot !== 1 && slot !== 2) || ads.some((ad) => ad.page === page && ad.slot === slot)) continue;
    if (["false", "0", "no"].includes(row.enabled?.toLowerCase())) continue;
    const filename = row.image;
    if (!filename || filename !== path.basename(filename) || !/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(filename)) continue;
    if (!fs.existsSync(path.join(directory, filename))) continue;

    let url: string | null = null;
    try {
      const destination = new URL(row.url);
      if (["https:", "http:"].includes(destination.protocol)) url = destination.href;
    } catch {
      // Vẫn hiển thị ảnh khi chưa cấu hình link đích.
    }
    ads.push({ page, slot, image: `/banner-ads/${encodeURIComponent(filename)}`, url, alt: row.alt || `Quảng cáo ${slot}` });
  }
  return ads;
}
