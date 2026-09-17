"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice, formatWeight, type Language } from "@/lib/products";
import type { LeadStatus, OrderLead } from "@/lib/leads";

const STATUS_OPTIONS: LeadStatus[] = ["pending", "contacted", "done"];

type AdminLeadsPanelProps = {
  isVi: boolean;
  language: Language;
  enabled: boolean;
};

export default function AdminLeadsPanel({
  isVi,
  language,
  enabled,
}: AdminLeadsPanelProps) {
  const [leads, setLeads] = useState<OrderLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notifyConfigured, setNotifyConfigured] = useState(false);

  const loadLeads = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/leads", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load leads.");
      const data = (await response.json()) as {
        leads: OrderLead[];
        notifyConfigured?: boolean;
      };
      setLeads(data.leads);
      setNotifyConfigured(Boolean(data.notifyConfigured));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const setStatus = async (id: string, status: LeadStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Failed to update lead.");
      const data = (await response.json()) as { lead: OrderLead };
      setLeads((current) =>
        current.map((lead) => (lead.id === data.lead.id ? data.lead : lead)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lead.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!enabled) return null;

  const pendingCount = leads.filter((lead) => lead.status === "pending").length;

  return (
    <section className="mt-8 border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-sea-deep">
            {isVi ? "Đơn lưu từ web" : "Saved web orders"}
          </h2>
          <p className="text-sm text-mist">
            {isVi
              ? `${pendingCount} đang chờ · khách lưu khi chat chưa kịp trả lời`
              : `${pendingCount} pending · saved when chat isn’t answered yet`}
            {" · "}
            {notifyConfigured
              ? isVi
                ? "đã bật webhook/email"
                : "webhook/email on"
              : isVi
                ? "chưa cấu hình báo đơn (LEAD_WEBHOOK_URL / Resend)"
                : "lead alerts not configured (LEAD_WEBHOOK_URL / Resend)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadLeads()}
          className="border border-line px-3 py-2 text-sm text-sea-deep hover:border-sea"
        >
          {isVi ? "Tải lại" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-mist">{isVi ? "Đang tải..." : "Loading..."}</p>
      ) : error ? (
        <p className="p-6 text-sm text-red-700">{error}</p>
      ) : leads.length === 0 ? (
        <p className="p-6 text-sm text-mist">
          {isVi
            ? "Chưa có đơn lưu. Đơn mới sẽ hiện khi khách thanh toán trên web."
            : "No saved orders yet. New ones appear when customers check out."}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {leads.slice(0, 30).map((lead) => (
            <li key={lead.id} className="space-y-2 p-4 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display font-semibold text-sea-deep">
                    {lead.id} · {lead.customer.name}
                  </p>
                  <p className="text-sm text-mist">
                    {lead.customer.phone} · {lead.channel} ·{" "}
                    {lead.customer.deliveryMethod || "vietnam"}
                    {lead.customer.countryCode
                      ? ` · ${lead.customer.countryCode}`
                      : ""}{" "}
                    ·{" "}
                    {new Date(lead.createdAt).toLocaleString(
                      language === "VI" ? "vi-VN" : "en-GB",
                    )}
                  </p>
                  <p className="mt-1 text-sm text-sea-deep/80">
                    {lead.customer.address}
                  </p>
                </div>
                <select
                  value={lead.status}
                  disabled={updatingId === lead.id}
                  onChange={(event) =>
                    void setStatus(lead.id, event.target.value as LeadStatus)
                  }
                  className="border border-line bg-background px-3 py-2 text-sm text-sea-deep"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-mist">
                {lead.items
                  .map(
                    (item) =>
                      `${language === "VI" ? item.name : item.nameEn} x${item.quantity}`,
                  )
                  .join(" · ")}
              </p>
              <p className="text-sm font-medium text-sea">
                {formatPrice(lead.totalPrice, language)} ·{" "}
                {formatWeight(lead.totalWeightGrams, language)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
