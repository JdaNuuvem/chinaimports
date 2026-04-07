/**
 * Renders a <script> tag with CSP nonce and optional SRI (Subresource Integrity).
 *
 * Usage:
 *   <SecureScript nonce={nonce} src="https://..." integrity="sha384-..." />
 *   <SecureScript nonce={nonce} dangerouslySetInnerHTML={{ __html: "..." }} />
 */

interface SecureScriptProps {
  nonce: string;
  src?: string;
  integrity?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  async?: boolean;
  defer?: boolean;
  dangerouslySetInnerHTML?: { __html: string };
  id?: string;
  type?: string;
}

export default function SecureScript({
  nonce,
  src,
  integrity,
  crossOrigin = "anonymous",
  async: isAsync = true,
  defer,
  dangerouslySetInnerHTML,
  id,
  type,
}: SecureScriptProps) {
  if (src) {
    return (
      <script
        nonce={nonce}
        src={src}
        integrity={integrity}
        crossOrigin={integrity ? crossOrigin : undefined}
        async={isAsync}
        defer={defer}
        id={id}
        type={type}
      />
    );
  }

  if (dangerouslySetInnerHTML) {
    return (
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        id={id}
        type={type}
      />
    );
  }

  return null;
}

/**
 * Known SRI hashes for commonly used external scripts.
 * Generate with: openssl dgst -sha384 -binary <file> | openssl base64 -A
 */
export const SRI_HASHES: Record<string, string> = {
  // Add SRI hashes for your external scripts here
  // "https://www.googletagmanager.com/gtag/js": "sha384-...",
};
