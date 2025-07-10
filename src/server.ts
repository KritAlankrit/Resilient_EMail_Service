// src/server.ts
import express from "express";
import { EmailService } from "./core/EmailService";

const app = express();
const port = 3000;
const emailService = new EmailService();

app.use(express.json());

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
  if (!status) return res.status(404).json({ error: "Not found" });
  res.json({ status });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
