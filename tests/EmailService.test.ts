import { EmailService } from "../src/core/EmailService";

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    // Use shorter retry delay for faster tests
    emailService = new EmailService(50);
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

  test("should prevent duplicate messageId after first is processed", async () => {
    emailService.enqueue({
      to: "test@example.com",
      subject: "Hello",
      body: "World",
      messageId: "msg-2"
    });

    // Wait for the message to be processed
    await new Promise((r) => setTimeout(r, 6000));

    const result2 = emailService.enqueue({
      to: "test@example.com",
      subject: "Again",
      body: "Duplicate",
      messageId: "msg-2"
    });

    expect(result2.status).toBe("duplicate");
  }, 10000); // 10 seconds

  test("should apply rate limiting", () => {
    const results = [];

    for (let i = 0; i < 12; i++) {
      results.push(
        emailService.enqueue({
          to: "rate@limit.com",
          subject: "Test",
          body: "Check",
          messageId: `rate-${i}`
        })
      );
    }

    const limited = results.filter((r) => r.status === "rate_limited");
    expect(limited.length).toBeGreaterThan(0);
  });

  test("should process queued email and update status", async () => {
    emailService.enqueue({
      to: "test@example.com",
      subject: "Process",
      body: "Queue",
      messageId: "msg-3"
    });

    await new Promise((r) => setTimeout(r, 6000));
    const status = emailService.getStatus("msg-3");

    expect(["success", "failed"]).toContain(status);
  }, 10000);

  test("should retry on failure and eventually succeed or fail", async () => {
    emailService.enqueue({
      to: "retry@example.com",
      subject: "Retry",
      body: "Backoff",
      messageId: "msg-4"
    });

    await new Promise((r) => setTimeout(r, 6000));
    const status = emailService.getStatus("msg-4");

    expect(["success", "failed"]).toContain(status);
  }, 10000);

  test("should return undefined for unknown messageId", () => {
    const status = emailService.getStatus("unknown-id");
    expect(status).toBeUndefined();
  });
});
