// src/providers/MockProvider2.ts
export class MockProvider2 {
  async send(to: string, subject: string, body: string): Promise<boolean> {
    const success = Math.random() > 0.2;
    if (success) return true;
    throw new Error("MockProvider2 failed");
  }
}
