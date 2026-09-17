import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  getFacebookPageId,
  getPublicSiteUrl,
  isFacebookPostingConfigured,
} from "@/lib/facebookPosts";
import { SHOP_CONTACT } from "@/lib/shopContact";

export async function GET() {
  const authenticated = await requireAdmin();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const configured = isFacebookPostingConfigured();
  const siteUrl = getPublicSiteUrl();
  const isLocalSite = /localhost|127\.0\.0\.1/i.test(siteUrl);

  return NextResponse.json({
    configured,
    pageId: getFacebookPageId(),
    pageUrl: SHOP_CONTACT.facebookUrl,
    siteUrl,
    canPublishPhotos: configured && !isLocalSite,
    warning: isLocalSite
      ? "Set NEXT_PUBLIC_SITE_URL to a public HTTPS domain before Facebook can fetch product photos."
      : null,
    setupHint: configured
      ? null
      : "Add FACEBOOK_PAGE_ACCESS_TOKEN (and optional FACEBOOK_PAGE_ID) to enable one-click Page posts.",
  });
}
