import type { OrderLead } from "@/lib/leads";
import { SHOP_CONTACT } from "@/lib/shopContact";
import { formatPrice, formatWeight } from "@/lib/products";

export type LeadNotifyResult = {
  webhook: "sent" | "skipped" | "failed";
  email: "sent" | "skipped" | "failed";
  errors: string[];
};

function getWebhookUrl() {
  return process.env.LEAD_WEBHOOK_URL?.trim() || "";
}

function getNotifyEmail() {
  return process.env.LEAD_NOTIFY_EMAIL?.trim() || "";
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

function getResendFrom() {
  return (
    process.env.LEAD_NOTIFY_FROM?.trim() ||
    "Duy Nhan Orders <onboarding@resend.dev>"
  );
}

export function isLeadNotifyConfigured() {
  return Boolean(getWebhookUrl() || (getResendApiKey() && getNotifyEmail()));
}

export function formatLeadNotifyText(lead: OrderLead): string {
  const isVi = lead.language === "VI";
  const lines = [
    isVi ? `Đơn web mới: ${lead.id}` : `New web order: ${lead.id}`,
    `${isVi ? "Kênh" : "Channel"}: ${lead.channel}`,
    `${isVi ? "Khách" : "Customer"}: ${lead.customer.name} · ${lead.customer.phone}`,
    `${isVi ? "Địa chỉ" : "Address"}: ${lead.customer.address}`,
    lead.customer.note
      ? `${isVi ? "Ghi chú" : "Note"}: ${lead.customer.note}`
      : null,
    "",
    ...lead.items.map((item) => {
      const name = isVi ? item.name : item.nameEn;
      return `- ${name} x${item.quantity} = ${formatPrice(item.unitPrice * item.quantity, lead.language)}`;
    }),
    "",
    `${isVi ? "Tổng" : "Total"}: ${formatPrice(lead.totalPrice, lead.language)} · ${formatWeight(lead.totalWeightGrams, lead.language)}`,
    `${isVi ? "Admin" : "Admin"}: /admin`,
    `${isVi ? "Zalo shop" : "Shop Zalo"}: ${SHOP_CONTACT.zaloUrl}`,
  ];
  return lines.filter((line) => line !== null).join("\n");
}

async function sendWebhook(lead: OrderLead): Promise<"sent" | "skipped" | "failed"> {
  const url = getWebhookUrl();
  if (!url) return "skipped";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lead.created",
        lead,
        text: formatLeadNotifyText(lead),
        zaloUrl: SHOP_CONTACT.zaloUrl,
        whatsappUrl: SHOP_CONTACT.whatsappUrl,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`Webhook HTTP ${response.status}`);
    }
    return "sent";
  } catch (error) {
    console.error("Lead webhook notify failed:", error);
    return "failed";
  }
}

async function sendEmail(lead: OrderLead): Promise<"sent" | "skipped" | "failed"> {
  const apiKey = getResendApiKey();
  const to = getNotifyEmail();
  if (!apiKey || !to) return "skipped";

  try {
    const subject =
      lead.language === "VI"
        ? `[Duy Nhân] Đơn web ${lead.id} — ${lead.customer.name}`
        : `[Duy Nhan] Web order ${lead.id} — ${lead.customer.name}`;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFrom(),
        to: [to],
        subject,
        text: formatLeadNotifyText(lead),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend HTTP ${response.status}: ${body.slice(0, 200)}`);
    }
    return "sent";
  } catch (error) {
    console.error("Lead email notify failed:", error);
    return "failed";
  }
}

/**
 * Best-effort shop alerts after a lead is saved.
 * Configure LEAD_WEBHOOK_URL (Zapier/Make/n8n → Zalo OA / Slack)
 * and/or RESEND_API_KEY + LEAD_NOTIFY_EMAIL.
 * Never throws — lead creation must succeed even if notify fails.
 */
export async function notifyLeadCreated(
  lead: OrderLead,
): Promise<LeadNotifyResult> {
  const errors: string[] = [];
  const [webhook, email] = await Promise.all([
    sendWebhook(lead),
    sendEmail(lead),
  ]);

  if (webhook === "failed") errors.push("webhook");
  if (email === "failed") errors.push("email");

  return { webhook, email, errors };
}
