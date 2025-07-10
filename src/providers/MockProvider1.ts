// src/providers/MockProvider1.ts
export class MockProvider1 {
  async send(to: string, subject: string, body: string): Promise<boolean> {
    const success = Math.random() > 0.3;
    if (success) return true;
    throw new Error("MockProvider1 failed");
  }
}
