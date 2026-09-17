import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "duynhan_admin_session";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "duynhan2026";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "duynhan-admin-session";
}

export function createAdminSessionToken() {
  return createHmac("sha256", getSessionSecret())
    .update(getAdminPassword())
    .digest("hex");
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false;
  const expected = createAdminSessionToken();
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function requireAdmin() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}
