const COOKIE_KEY = "ua_cookie_consent";

export function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_KEY) === "accepted";
}

export function setConsent(accepted: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_KEY, accepted ? "accepted" : "rejected");
}
