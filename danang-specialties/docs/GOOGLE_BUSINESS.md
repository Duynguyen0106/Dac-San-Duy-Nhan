# Google Business Profile (Maps) — NAP checklist

Keep **Name / Address / Phone** identical across Google Business, the website footer, Facebook, and Zalo.

Source of truth in code: `src/lib/shopContact.ts`.

## Exact NAP to publish

| Field | Value |
| --- | --- |
| **Name** | Duy Nhân - Đặc Sản Đà Nẵng |
| **Address (VI)** | Kiốt số 6, 90 đường Hùng Vương, quận Hải Châu, thành phố Đà Nẵng, 55000, Việt Nam |
| **Address (EN)** | Kiosk No. 6, 90 Hung Vuong Street, Hai Chau District, Da Nang 55000, Vietnam |
| **Primary phone** | 0905 747 413 (`+84 905 747 413`) |
| **Alt phone** | 0983 871 071 |
| **Hours** | 07:00 – 21:00 (daily) |
| **Website** | Production URL from `NEXT_PUBLIC_SITE_URL` |
| **Category** | Specialty food store / Gift shop (or closest Vietnamese GBP category) |

## Checklist (owner)

1. Open [Google Business Profile](https://business.google.com/) for this listing (or create one if missing).
2. Set **Business name** exactly as above — avoid extra slogans in the name field.
3. Paste the **address** to match the table (Kiốt số 6, 90 Hùng Vương…).
4. Set **primary phone** to `0905 747 413`; add the alt number if GBP allows.
5. Set **hours** to 07:00–21:00 every day (or note exceptions for Tet separately).
6. Add **website** = production domain; add UTM-free homepage + `/shop` if GBP supports multiple links.
7. Upload 3–10 photos: storefront (`/brand/shop-stall-hero.jpg` style), gift baskets, dried seafood packs.
8. Confirm NAP matches:
   - Website footer / JSON-LD LocalBusiness
   - Facebook Page “About”
   - Zalo business profile (if any)
9. After changes, request a Maps crawl / wait for Google to refresh (often a few days).

## Optional boosts

- Post weekly Google updates linking to `/promo/tet-gifts` or `/promo/airport-packing`.
- Ask happy customers for Google reviews (same language as the visit).
- Keep `docs/SEARCH_CONSOLE.md` sitemap submission in sync once the domain is stable.

This file is documentation only; GBP edits must be done by the listing owner.
