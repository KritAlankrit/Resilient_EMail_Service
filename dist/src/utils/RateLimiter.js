"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
// src/utils/RateLimiter.ts
class RateLimiter {
    constructor() {
        this.requests = [];
    }
    allow() {
        const now = Date.now();
        this.requests = this.requests.filter(ts => now - ts < 60000);
        if (this.requests.length >= 10)
            return false;
        this.requests.push(now);
        return true;
    }
}
exports.RateLimiter = RateLimiter;
