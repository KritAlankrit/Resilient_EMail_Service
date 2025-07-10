"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
// src/utils/CircuitBreaker.ts
class CircuitBreaker {
    constructor(failureThreshold = 3, resetTimeout = 10000) {
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.openUntil = 0;
    }
    allow() {
        const now = Date.now();
        if (now < this.openUntil)
            return false;
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
exports.CircuitBreaker = CircuitBreaker;
