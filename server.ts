// server.ts
import express from 'express';
import { emailService } from './src/serviceInstance';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Resilient Email Service is live!');
});

// POST /send-email
app.post('/send-email', (req, res) => {
  const { to, subject, body, messageId } = req.body;

  if (!to || !subject || !body || !messageId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = emailService.enqueue({ to, subject, body, messageId });
  res.status(200).json(result);
});

// GET /status?messageId=...
app.get('/status', (req, res) => {
  const messageId = req.query.messageId as string;

  if (!messageId) {
    return res.status(400).json({ error: 'Missing messageId' });
  }

  const status = emailService.getStatus(messageId);
  if (!status) return res.status(404).json({ status: 'not_found' });
  res.status(200).json({ status });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
