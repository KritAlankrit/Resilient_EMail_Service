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
const EmailService_1 = require("../src/core/EmailService");
describe("EmailService", () => {
    let emailService;
    beforeEach(() => {
        // Use shorter retry delay for faster tests
        emailService = new EmailService_1.EmailService(50);
    });
    test("should enqueue email and track pending status", () => {
        const result = emailService.enqueue({
            to: "test@example.com",
            subject: "Hello",
            body: "World",
            messageId: "msg-1"
        });
        expect(result.status).toBe("queued");
        expect(emailService.getStatus("msg-1")).toBe("pending");
    });
    test("should prevent duplicate messageId after first is processed", () => __awaiter(void 0, void 0, void 0, function* () {
        emailService.enqueue({
            to: "test@example.com",
            subject: "Hello",
            body: "World",
            messageId: "msg-2"
        });
        // Wait for the message to be processed
        yield new Promise((r) => setTimeout(r, 6000));
        const result2 = emailService.enqueue({
            to: "test@example.com",
            subject: "Again",
            body: "Duplicate",
            messageId: "msg-2"
        });
        expect(result2.status).toBe("duplicate");
    }), 10000); // 10 seconds
    test("should apply rate limiting", () => {
        const results = [];
        for (let i = 0; i < 12; i++) {
            results.push(emailService.enqueue({
                to: "rate@limit.com",
                subject: "Test",
                body: "Check",
                messageId: `rate-${i}`
            }));
        }
        const limited = results.filter((r) => r.status === "rate_limited");
        expect(limited.length).toBeGreaterThan(0);
    });
    test("should process queued email and update status", () => __awaiter(void 0, void 0, void 0, function* () {
        emailService.enqueue({
            to: "test@example.com",
            subject: "Process",
            body: "Queue",
            messageId: "msg-3"
        });
        yield new Promise((r) => setTimeout(r, 6000));
        const status = emailService.getStatus("msg-3");
        expect(["success", "failed"]).toContain(status);
    }), 10000);
    test("should retry on failure and eventually succeed or fail", () => __awaiter(void 0, void 0, void 0, function* () {
        emailService.enqueue({
            to: "retry@example.com",
            subject: "Retry",
            body: "Backoff",
            messageId: "msg-4"
        });
        yield new Promise((r) => setTimeout(r, 6000));
        const status = emailService.getStatus("msg-4");
        expect(["success", "failed"]).toContain(status);
    }), 10000);
    test("should return undefined for unknown messageId", () => {
        const status = emailService.getStatus("unknown-id");
        expect(status).toBeUndefined();
    });
});
