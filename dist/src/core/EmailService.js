"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
// src/core/EmailService.ts
const MockProvider1_1 = require("../providers/MockProvider1");
const MockProvider2_1 = require("../providers/MockProvider2");
const CircuitBreaker_1 = require("../utils/CircuitBreaker");
const RateLimiter_1 = require("../utils/RateLimiter");
const Logger_1 = require("../utils/Logger");
class EmailService {
    constructor(retryDelay = 500) {
        this.retryDelay = retryDelay;
        this.provider1 = new MockProvider1_1.MockProvider1();
        this.provider2 = new MockProvider2_1.MockProvider2();
        this.breaker1 = new CircuitBreaker_1.CircuitBreaker();
        this.breaker2 = new CircuitBreaker_1.CircuitBreaker();
        this.limiter = new RateLimiter_1.RateLimiter();
        this.logger = new Logger_1.Logger();
        this.sentIds = new Set();
        this.statusMap = new Map();
        this.queue = [];
        this.isProcessing = false;
        setInterval(() => this.processQueue(), 500);
    }
    enqueue(email) {
        if (!this.limiter.allow()) {
            this.logger.log("Rate limit exceeded");
            return { status: "rate_limited" };
        }
        if (this.sentIds.has(email.messageId)) {
            this.logger.log(`Duplicate: ${email.messageId}`);
            return { status: "duplicate" };
        }
        this.statusMap.set(email.messageId, "pending");
        this.queue.push(email);
        this.logger.log(`Enqueued: ${email.messageId}`);
        return { status: "queued" };
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isProcessing || this.queue.length === 0)
                return;
            this.isProcessing = true;
            const email = this.queue.shift();
            if (!email)
                return;
            const { to, subject, body, messageId } = email;
            const trySend = (provider, name, breaker) => __awaiter(this, void 0, void 0, function* () {
                if (!breaker.allow()) {
                    this.logger.log(`${name} circuit open`);
                    throw new Error("Circuit open");
                }
                for (let i = 0; i < 3; i++) {
                    try {
                        yield provider.send(to, subject, body);
                        breaker.recordSuccess();
                        this.logger.log(`Sent via ${name} on attempt ${i + 1}`);
                        return true;
                    }
                    catch (err) {
                        breaker.recordFailure();
                        this.logger.log(`Retry ${i + 1} failed via ${name}`);
                        yield new Promise((r) => setTimeout(r, this.retryDelay * 2 ** i));
                    }
                }
                return false;
            });
            try {
                let sent = false;
                if (this.breaker1.allow()) {
                    sent = yield trySend(this.provider1, "Provider1", this.breaker1);
                }
                if (!sent && this.breaker2.allow()) {
                    sent = yield trySend(this.provider2, "Provider2", this.breaker2);
                }
                if (sent) {
                    this.sentIds.add(messageId);
                    this.statusMap.set(messageId, "success");
                    this.logger.log(`Message ${messageId} sent successfully`);
                }
                else {
                    this.statusMap.set(messageId, "failed");
                    this.logger.log(`Message ${messageId} failed`);
                }
            }
            catch (e) {
                this.statusMap.set(messageId, "failed");
                this.logger.log(`Unhandled error: ${e}`);
            }
            this.isProcessing = false;
        });
    }
    getStatus(messageId) {
        return this.statusMap.get(messageId);
    }
}
exports.EmailService = EmailService;
