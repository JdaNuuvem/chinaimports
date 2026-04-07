type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerConfig {
  failureThreshold: number;   // failures before opening
  failureWindowMs: number;    // window to count failures
  openDurationMs: number;     // how long to stay open
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  failureWindowMs: 30_000,    // 30 seconds
  openDurationMs: 60_000,     // 60 seconds
};

class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failures: number[] = [];
  private openedAt = 0;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get currentState(): CircuitState {
    if (this.state === "OPEN") {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed >= this.config.openDurationMs) {
        this.state = "HALF_OPEN";
      }
    }
    return this.state;
  }

  get isOpen(): boolean {
    return this.currentState === "OPEN";
  }

  get allowRequest(): boolean {
    const state = this.currentState;
    return state === "CLOSED" || state === "HALF_OPEN";
  }

  recordSuccess(): void {
    this.failures = [];
    this.state = "CLOSED";
  }

  recordFailure(): void {
    const now = Date.now();

    // Clean old failures outside window
    this.failures = this.failures.filter(
      (t) => now - t < this.config.failureWindowMs
    );
    this.failures.push(now);

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      this.openedAt = now;
      return;
    }

    if (this.failures.length >= this.config.failureThreshold) {
      this.state = "OPEN";
      this.openedAt = now;
    }
  }

  reset(): void {
    this.state = "CLOSED";
    this.failures = [];
    this.openedAt = 0;
  }

  status(): { state: CircuitState; failures: number; nextRetryIn: number | null } {
    const state = this.currentState;
    return {
      state,
      failures: this.failures.length,
      nextRetryIn:
        state === "OPEN"
          ? Math.max(0, this.config.openDurationMs - (Date.now() - this.openedAt))
          : null,
    };
  }
}

// Singleton instance for Medusa API
export const medusaCircuitBreaker = new CircuitBreaker();

export { CircuitBreaker };
export type { CircuitBreakerConfig, CircuitState };
