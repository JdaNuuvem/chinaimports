import crypto from "crypto";

const CSRF_SECRET = process.env.REVALIDATION_SECRET || "csrf-secret";

export function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString("hex");
  const payload = `${timestamp}.${random}`;
  const signature = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return `${payload}.${signature}`;
}

export function verifyCsrfToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [timestamp, random, signature] = parts;
  const payload = `${timestamp}.${random}`;
  const expected = crypto
    .createHmac("sha256", CSRF_SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  if (signature !== expected) return false;

  // Token expires after 4 hours
  const created = parseInt(timestamp, 36);
  if (Date.now() - created > 4 * 60 * 60 * 1000) return false;

  return true;
}
