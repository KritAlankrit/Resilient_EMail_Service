"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const serviceInstance_1 = require("./src/serviceInstance");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// POST /send-email
app.post('/send-email', (req, res) => {
    const { to, subject, body, messageId } = req.body;
    if (!to || !subject || !body || !messageId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = serviceInstance_1.emailService.enqueue({ to, subject, body, messageId });
    res.status(200).json(result);
});
// GET /status?messageId=...
app.get('/status', (req, res) => {
    const messageId = req.query.messageId;
    if (!messageId) {
        return res.status(400).json({ error: 'Missing messageId' });
    }
    const status = serviceInstance_1.emailService.getStatus(messageId);
    if (!status)
        return res.status(404).json({ status: 'not_found' });
    res.status(200).json({ status });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
