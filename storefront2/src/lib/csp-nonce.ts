import { headers } from "next/headers";

/**
 * Get the CSP nonce from the middleware.
 * Only works in server components.
 */
export async function getNonce(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-nonce") || "";
}
