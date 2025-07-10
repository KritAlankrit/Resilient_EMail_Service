"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const EmailService_1 = require("./core/EmailService");
const app = (0, express_1.default)();
const port = 3000;
const emailService = new EmailService_1.EmailService();
app.use(express_1.default.json());
app.post("/send", (req, res) => {
    const { to, subject, body, messageId } = req.body;
    if (!to || !subject || !body || !messageId) {
        return res.status(400).json({ error: "Missing fields" });
    }
    const result = emailService.enqueue({ to, subject, body, messageId });
    res.json(result);
});
app.get("/status/:id", (req, res) => {
    const status = emailService.getStatus(req.params.id);
    if (!status)
        return res.status(404).json({ error: "Not found" });
    res.json({ status });
});
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
