"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// src/utils/Logger.ts
class Logger {
    log(message) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
}
exports.Logger = Logger;
