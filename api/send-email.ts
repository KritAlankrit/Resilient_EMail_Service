import { emailService } from "../src/serviceInstance";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const { to, subject, body, messageId } = req.body;

  if (!to || !subject || !body || !messageId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const result = emailService.enqueue({ to, subject, body, messageId });
  res.status(200).json(result);
}
