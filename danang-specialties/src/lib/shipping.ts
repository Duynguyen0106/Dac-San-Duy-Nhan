import ratesData from "../../data/shipping-rates.json";
import { formatPrice, type Language, type Product } from "@/lib/products";

export type ShippingZoneId =
  | "pickup"
  | "vn_local"
  | "vn_domestic"
  | "asia"
  | "au_nz"
  | "eu_uk"
  | "north_america"
  | "row";

export type DeliveryMethod = "pickup" | "vietnam" | "international";

export type ShippingBand = {
  maxKg: number;
  fee: number;
};

export type ShippingZone = {
  id: ShippingZoneId;
  labelVi: string;
  labelEn: string;
  etaVi: string;
  etaEn: string;
  countries: string[];
  bands: ShippingBand[];
};

export type ShippingCountry = {
  code: string;
  nameVi: string;
  nameEn: string;
};

type ShippingRatesFile = {
  packagingBufferGrams: number;
  packagingBufferPercent: number;
  currency: string;
  noteVi: string;
  noteEn: string;
  zones: ShippingZone[];
  countries: ShippingCountry[];
  airRestrictedKeywords: string[];
};

const rates = ratesData as ShippingRatesFile;

export const SHIPPING_COUNTRIES: ShippingCountry[] = rates.countries;
export const SHIPPING_ZONES: ShippingZone[] = rates.zones;
export const SHIPPING_NOTE_VI = rates.noteVi;
export const SHIPPING_NOTE_EN = rates.noteEn;

export function getZoneById(id: ShippingZoneId): ShippingZone | undefined {
  return SHIPPING_ZONES.find((zone) => zone.id === id);
}

export function resolveShippingZone(
  method: DeliveryMethod,
  countryCode: string,
): ShippingZoneId {
  if (method === "pickup") return "pickup";
  if (method === "vietnam") {
    return countryCode === "VN-DN" ? "vn_local" : "vn_domestic";
  }

  const code = countryCode.trim().toUpperCase();
  if (!code || code === "VN") return "vn_domestic";
  if (code === "OTHER") return "row";

  for (const zone of SHIPPING_ZONES) {
    if (zone.id === "pickup" || zone.id === "vn_local" || zone.id === "vn_domestic") {
      continue;
    }
    if (zone.countries.includes(code)) return zone.id;
  }
  return "row";
}

/** Chargeable weight = product grams + packaging buffer. */
export function getChargeableWeightGrams(productWeightGrams: number): number {
  const buffered = Math.ceil(
    productWeightGrams * (1 + rates.packagingBufferPercent) +
      rates.packagingBufferGrams,
  );
  return Math.max(buffered, productWeightGrams);
}

export function estimateShippingFee(
  zoneId: ShippingZoneId,
  productWeightGrams: number,
): number {
  const zone = getZoneById(zoneId);
  if (!zone) return 0;
  const chargeableKg = getChargeableWeightGrams(productWeightGrams) / 1000;
  for (const band of zone.bands) {
    if (chargeableKg <= band.maxKg) return band.fee;
  }
  return zone.bands[zone.bands.length - 1]?.fee ?? 0;
}

export function getZoneLabel(zone: ShippingZone, language: Language): string {
  return language === "VI" ? zone.labelVi : zone.labelEn;
}

export function getZoneEta(zone: ShippingZone, language: Language): string {
  return language === "VI" ? zone.etaVi : zone.etaEn;
}

export function getCountryLabel(
  country: ShippingCountry,
  language: Language,
): string {
  return language === "VI" ? country.nameVi : country.nameEn;
}

export function getShippingNote(language: Language): string {
  return language === "VI" ? rates.noteVi : rates.noteEn;
}

export type ShippingEstimate = {
  zoneId: ShippingZoneId;
  zone: ShippingZone;
  productWeightGrams: number;
  chargeableWeightGrams: number;
  shippingFee: number;
  grandTotal: number;
};

export function buildShippingEstimate({
  method,
  countryCode,
  productWeightGrams,
  productSubtotal,
}: {
  method: DeliveryMethod;
  countryCode: string;
  productWeightGrams: number;
  productSubtotal: number;
}): ShippingEstimate {
  const zoneId = resolveShippingZone(method, countryCode);
  const zone = getZoneById(zoneId) ?? SHIPPING_ZONES[0];
  const chargeableWeightGrams = getChargeableWeightGrams(productWeightGrams);
  const shippingFee = estimateShippingFee(zoneId, productWeightGrams);
  return {
    zoneId,
    zone,
    productWeightGrams,
    chargeableWeightGrams,
    shippingFee,
    grandTotal: productSubtotal + shippingFee,
  };
}

/** Soft-flag sauces/liquids that often need extra packing or checked-bag rules. */
export function findAirCautionProducts(products: Product[]): Product[] {
  const keywords = rates.airRestrictedKeywords.map((k) => k.toLowerCase());
  return products.filter((product) => {
    const hay = `${product.name} ${product.nameEn} ${product.category}`.toLowerCase();
    return keywords.some((keyword) => hay.includes(keyword));
  });
}

export function formatShippingSummary(
  estimate: ShippingEstimate,
  language: Language,
): string {
  const isVi = language === "VI";
  return [
    `${isVi ? "Khu vực" : "Zone"}: ${getZoneLabel(estimate.zone, language)}`,
    `${isVi ? "Cân tính phí" : "Chargeable weight"}: ${(
      estimate.chargeableWeightGrams / 1000
    ).toFixed(2)} kg`,
    `${isVi ? "Ship ước tính" : "Est. shipping"}: ${formatPrice(estimate.shippingFee, language)}`,
    `${isVi ? "Tổng ước tính" : "Est. grand total"}: ${formatPrice(estimate.grandTotal, language)}`,
  ].join("\n");
}

/** Sample rate rows for the public /shipping page. */
export function listPublicShippingZones(): ShippingZone[] {
  return SHIPPING_ZONES.filter((zone) => zone.id !== "pickup");
}
