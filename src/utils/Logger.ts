// src/utils/Logger.ts
export class Logger {
  log(message: string) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}
