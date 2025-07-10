// src/utils/CircuitBreaker.ts
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private openUntil = 0;

  constructor(private failureThreshold = 3, private resetTimeout = 10000) {}

  allow(): boolean {
    const now = Date.now();
    if (now < this.openUntil) return false;
    return true;
  }

  recordFailure() {
    const now = Date.now();
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.openUntil = now + this.resetTimeout;
      this.failureCount = 0;
    }
    this.lastFailureTime = now;
  }

  recordSuccess() {
    this.failureCount = 0;
  }
}
