# Google Search Console & Bing Webmaster

After deploying with a stable public domain:

1. Set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://duynhan.vn`).
2. Confirm `https://YOUR_DOMAIN/sitemap.xml` and `/robots.txt` load.
3. **Google Search Console** → Add property → Submit sitemap: `https://YOUR_DOMAIN/sitemap.xml`
4. **Bing Webmaster Tools** → Add site → Submit the same sitemap URL.

This file is documentation only; submission must be done in each search console by the site owner.

## After the 50 tip posts go live

1. Open `https://YOUR_DOMAIN/sitemap.xml` and confirm ~50 `/tips/...` URLs are listed.
2. In Search Console → **Sitemaps** → resubmit `sitemap.xml` (or wait for the next crawl).
3. **URL Inspection** → request indexing for high-value pages first:
   - `/tips`
   - `/shop`
   - `/shop/dried-seafood`
   - `/shop/gifts`
   - A few tip posts, e.g. `/tips/pack-da-nang-specialties-for-flights`, `/tips/da-nang-gift-ideas`
4. Tip articles link to matching shop categories and products — that internal linking helps crawl depth after Google finds `/tips`.

## Optional: Bing + IndexNow

If you use Bing Webmaster, submit the same sitemap. IndexNow is optional and only needed if you want faster Bing pickup after large content updates.
