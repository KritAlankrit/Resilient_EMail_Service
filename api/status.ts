import { emailService } from "../src/serviceInstance";

export default function handler(req: any, res: any) {
  const { messageId } = req.query;

  if (!messageId || typeof messageId !== 'string') {
    res.status(400).json({ error: 'messageId is required' });
    return;
  }

  const status = emailService.getStatus(messageId);
  res.status(200).json({ status });
}
