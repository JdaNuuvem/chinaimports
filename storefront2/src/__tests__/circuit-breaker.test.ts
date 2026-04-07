import { describe, it, expect, beforeEach } from "vitest";
import { CircuitBreaker } from "@/lib/circuit-breaker";

describe("CircuitBreaker", () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker({
      failureThreshold: 3,
      failureWindowMs: 5000,
      openDurationMs: 1000,
    });
  });

  it("should start in CLOSED state", () => {
    expect(cb.currentState).toBe("CLOSED");
    expect(cb.allowRequest).toBe(true);
  });

  it("should stay CLOSED with fewer failures than threshold", () => {
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.currentState).toBe("CLOSED");
    expect(cb.allowRequest).toBe(true);
  });

  it("should open after reaching failure threshold", () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.currentState).toBe("OPEN");
    expect(cb.allowRequest).toBe(false);
  });

  it("should transition to HALF_OPEN after open duration", async () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.isOpen).toBe(true);

    // Wait for open duration
    await new Promise((r) => setTimeout(r, 1100));
    expect(cb.currentState).toBe("HALF_OPEN");
    expect(cb.allowRequest).toBe(true);
  });

  it("should close on success after HALF_OPEN", async () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    await new Promise((r) => setTimeout(r, 1100));
    expect(cb.currentState).toBe("HALF_OPEN");

    cb.recordSuccess();
    expect(cb.currentState).toBe("CLOSED");
  });

  it("should reopen on failure in HALF_OPEN", async () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    await new Promise((r) => setTimeout(r, 1100));
    expect(cb.currentState).toBe("HALF_OPEN");

    cb.recordFailure();
    expect(cb.currentState).toBe("OPEN");
  });

  it("should reset to CLOSED", () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.currentState).toBe("OPEN");

    cb.reset();
    expect(cb.currentState).toBe("CLOSED");
  });

  it("should report status correctly", () => {
    const status = cb.status();
    expect(status.state).toBe("CLOSED");
    expect(status.failures).toBe(0);
    expect(status.nextRetryIn).toBeNull();
  });
});
