export class RateLimiter {
  private requests: number[] = [];

  allow(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(ts => now - ts < 60000);
    if (this.requests.length >= 10) return false;
    this.requests.push(now);
    return true;
  }
}
