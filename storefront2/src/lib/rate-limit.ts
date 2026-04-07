const submissions = new Map<string, number[]>();

/**
 * Client-side rate limiter for form submissions.
 * Returns true if the action is allowed, false if rate limited.
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const attempts = submissions.get(key) || [];

  // Remove expired attempts
  const valid = attempts.filter((t) => now - t < windowMs);

  if (valid.length >= maxAttempts) {
    return false;
  }

  valid.push(now);
  submissions.set(key, valid);
  return true;
}

/**
 * Returns remaining seconds until rate limit resets.
 */
export function getRateLimitReset(key: string, windowMs: number): number {
  const attempts = submissions.get(key) || [];
  if (attempts.length === 0) return 0;
  const oldest = Math.min(...attempts);
  const resetAt = oldest + windowMs;
  return Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));
}
