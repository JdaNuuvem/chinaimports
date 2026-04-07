"use client";

/**
 * Invisible honeypot field to catch bots.
 * Bots typically fill all fields including hidden ones.
 * If this field has a value, the submission is from a bot.
 *
 * Usage:
 * 1. Add <Honeypot /> inside your form
 * 2. Check `isBot(formData)` before processing
 */

export default function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        opacity: 0,
        height: 0,
        width: 0,
        overflow: "hidden",
      }}
    >
      <label htmlFor="website_url">Website</label>
      <input
        type="text"
        id="website_url"
        name="website_url"
        autoComplete="off"
        tabIndex={-1}
      />
    </div>
  );
}

/**
 * Check if form submission is from a bot by examining the honeypot field.
 * Returns true if the submission appears to be from a bot.
 */
export function isBot(formData: FormData | Record<string, unknown>): boolean {
  if (formData instanceof FormData) {
    const value = formData.get("website_url");
    return typeof value === "string" && value.length > 0;
  }
  return typeof formData.website_url === "string" && (formData.website_url as string).length > 0;
}
