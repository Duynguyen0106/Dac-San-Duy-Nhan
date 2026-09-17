import { promises as fs } from "fs";
import path from "path";
import type { Language } from "@/lib/products";
import type { CheckoutFormValues, PaymentMethod } from "@/lib/checkout";

export type LeadChannel = "zalo" | "whatsapp" | "saved_only";
export type LeadStatus = "pending" | "contacted" | "done";

export type LeadLineItem = {
  productId: number;
  name: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  weight: string;
};

export type OrderLead = {
  id: string;
  createdAt: string;
  status: LeadStatus;
  language: Language;
  channel: LeadChannel;
  customer: CheckoutFormValues;
  items: LeadLineItem[];
  totalPrice: number;
  totalWeightGrams: number;
  message: string;
};

export type CreateLeadInput = {
  language: Language;
  channel: LeadChannel;
  customer: CheckoutFormValues;
  items: LeadLineItem[];
  totalPrice: number;
  totalWeightGrams: number;
  message: string;
};

const DATA_PATH = path.join(process.cwd(), "data", "leads.json");

const PAYMENT_METHODS: PaymentMethod[] = ["COD", "BankTransfer"];

async function ensureLeadsFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, "[]\n", "utf8");
  }
}

export async function readLeads(): Promise<OrderLead[]> {
  await ensureLeadsFile();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as OrderLead[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeLeads(leads: OrderLead[]) {
  await fs.writeFile(DATA_PATH, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
}

function makeLeadId() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DN-${stamp}-${rand}`;
}

export function validateLeadInput(body: unknown): {
  ok: true;
  data: CreateLeadInput;
} | {
  ok: false;
  error: string;
} {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid lead payload." };
  }
  const input = body as Record<string, unknown>;
  const language = input.language === "EN" ? "EN" : input.language === "VI" ? "VI" : null;
  if (!language) return { ok: false, error: "language must be VI or EN." };

  const channel =
    input.channel === "zalo" ||
    input.channel === "whatsapp" ||
    input.channel === "saved_only"
      ? input.channel
      : null;
  if (!channel) return { ok: false, error: "Invalid channel." };

  const customerRaw = input.customer;
  if (!customerRaw || typeof customerRaw !== "object") {
    return { ok: false, error: "customer is required." };
  }
  const customerObj = customerRaw as Record<string, unknown>;
  const name = String(customerObj.name ?? "").trim();
  const phone = String(customerObj.phone ?? "").trim();
  const address = String(customerObj.address ?? "").trim();
  const note = String(customerObj.note ?? "").trim();
  const paymentMethod = customerObj.paymentMethod;
  const deliveryMethodRaw = customerObj.deliveryMethod;
  const deliveryMethod =
    deliveryMethodRaw === "pickup" ||
    deliveryMethodRaw === "vietnam" ||
    deliveryMethodRaw === "international"
      ? deliveryMethodRaw
      : "vietnam";
  const countryCode = String(customerObj.countryCode ?? "VN").trim() || "VN";
  const city = String(customerObj.city ?? "").trim();
  const postalCode = String(customerObj.postalCode ?? "").trim();

  if (!name || name.length < 2) {
    return { ok: false, error: "Customer name is required." };
  }
  if (!phone) return { ok: false, error: "Customer phone is required." };
  if (!address || address.length < 4) {
    return { ok: false, error: "Customer address is required." };
  }
  if (
    paymentMethod !== "COD" &&
    paymentMethod !== "BankTransfer" &&
    !PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)
  ) {
    return { ok: false, error: "Invalid payment method." };
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "At least one line item is required." };
  }

  const items: LeadLineItem[] = [];
  for (const row of input.items) {
    if (!row || typeof row !== "object") {
      return { ok: false, error: "Invalid line item." };
    }
    const item = row as Record<string, unknown>;
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity < 1) {
      return { ok: false, error: "Invalid line item quantities." };
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return { ok: false, error: "Invalid line item price." };
    }
    items.push({
      productId,
      name: String(item.name ?? "").trim() || `Product ${productId}`,
      nameEn: String(item.nameEn ?? "").trim() || `Product ${productId}`,
      quantity: Math.round(quantity),
      unitPrice: Math.round(unitPrice),
      weight: String(item.weight ?? "").trim() || "—",
    });
  }

  const totalPrice = Number(input.totalPrice);
  const totalWeightGrams = Number(input.totalWeightGrams);
  if (!Number.isFinite(totalPrice) || totalPrice < 0) {
    return { ok: false, error: "Invalid totalPrice." };
  }
  if (!Number.isFinite(totalWeightGrams) || totalWeightGrams < 0) {
    return { ok: false, error: "Invalid totalWeightGrams." };
  }

  const message = String(input.message ?? "").trim();
  if (!message) return { ok: false, error: "Order message is required." };

  const customer: CheckoutFormValues = {
    name,
    phone,
    address,
    note,
    paymentMethod: paymentMethod as PaymentMethod,
    deliveryMethod,
    countryCode,
    city,
    postalCode,
  };

  return {
    ok: true,
    data: {
      language,
      channel,
      customer,
      items,
      totalPrice: Math.round(totalPrice),
      totalWeightGrams: Math.round(totalWeightGrams),
      message,
    },
  };
}

export async function createLead(input: CreateLeadInput): Promise<OrderLead> {
  const leads = await readLeads();
  const lead: OrderLead = {
    id: makeLeadId(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...input,
  };
  leads.unshift(lead);
  // Keep the file from growing forever in this simple store.
  await writeLeads(leads.slice(0, 500));
  return lead;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<OrderLead | null> {
  const leads = await readLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return null;
  leads[index] = { ...leads[index], status };
  await writeLeads(leads);
  return leads[index];
}
