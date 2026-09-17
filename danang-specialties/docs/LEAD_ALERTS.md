# Lead alerts (webhook / email → Zalo)

When a customer saves a checkout order, the API stores it in `data/leads.json` and then tries optional alerts.

## Options

### 1. Webhook → Zalo (recommended)

1. Create a Zapier / Make / n8n scenario that accepts a JSON POST.
2. Map the payload field `text` (or `lead`) into a Zalo OA / group message / Slack.
3. Set on the host:

```bash
LEAD_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
```

Payload shape:

```json
{
  "event": "lead.created",
  "lead": { "...": "OrderLead object" },
  "text": "Đơn web mới: DN-...",
  "zaloUrl": "https://zalo.me/0905747413",
  "whatsappUrl": "https://wa.me/447882843513"
}
```

Zalo personal accounts cannot be messaged server-side without Official Account APIs. Use the webhook bridge, or open `zaloUrl` manually from the admin leads list.

### 2. Email via Resend

```bash
RESEND_API_KEY=re_...
LEAD_NOTIFY_EMAIL=you@example.com
# optional:
LEAD_NOTIFY_FROM="Duy Nhan Orders <orders@your-domain.com>"
```

## Behaviour

- Lead **always** saves even if notify fails.
- Response includes `{ notify: { webhook, email, errors } }` for debugging.
- Admin → “Đơn lưu từ web” shows whether alerts are configured.

See also `.env.example`.
