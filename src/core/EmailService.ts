import { MockProvider1 } from "../providers/MockProvider1";
import { MockProvider2 } from "../providers/MockProvider2";
import { CircuitBreaker } from "../utils/CircuitBreaker";
import { RateLimiter } from "../utils/RateLimiter";
import { Logger } from "../utils/Logger";

type EmailRequest = {
    to: string;
    subject: string;
    body: string;
    messageId: string;
};

export class EmailService {
    private provider1 = new MockProvider1();
    private provider2 = new MockProvider2();
    private breaker1 = new CircuitBreaker();
    private breaker2 = new CircuitBreaker();
    private limiter = new RateLimiter();
    private logger = new Logger();

    private sentIds = new Set<string>();
    private statusMap = new Map<string, string>();
    private queue: EmailRequest[] = [];
    private isProcessing = false;

    constructor(private retryDelay = 500) {
        setInterval(() => this.processQueue(), 500);
    }


    enqueue(email: EmailRequest) {
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

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        const email = this.queue.shift();
        if (!email) return;

        const { to, subject, body, messageId } = email;

        const trySend = async (
            provider: any,
            name: string,
            breaker: CircuitBreaker
        ) => {
            if (!breaker.allow()) {
                this.logger.log(`${name} circuit open`);
                throw new Error("Circuit open");
            }

            for (let i = 0; i < 3; i++) {
                try {
                    await provider.send(to, subject, body);
                    breaker.recordSuccess();
                    this.logger.log(`Sent via ${name} on attempt ${i + 1}`);
                    return true;
                } catch (err) {
                    breaker.recordFailure();
                    this.logger.log(`Retry ${i + 1} failed via ${name}`);
                    await new Promise((r) => setTimeout(r, this.retryDelay * 2 ** i));
                }
            }
            return false;
        };

        try {
            let sent = false;

            if (this.breaker1.allow()) {
                sent = await trySend(this.provider1, "Provider1", this.breaker1);
            }

            if (!sent && this.breaker2.allow()) {
                sent = await trySend(this.provider2, "Provider2", this.breaker2);
            }

            if (sent) {
                this.sentIds.add(messageId);
                this.statusMap.set(messageId, "success");
                this.logger.log(`Message ${messageId} sent successfully`);
            } else {
                this.statusMap.set(messageId, "failed");
                this.logger.log(`Message ${messageId} failed`);
            }
        } catch (e) {
            this.statusMap.set(messageId, "failed");
            this.logger.log(`Unhandled error: ${e}`);
        }

        this.isProcessing = false;
    }

    getStatus(messageId: string): string | undefined {
        return this.statusMap.get(messageId);
    }
}
