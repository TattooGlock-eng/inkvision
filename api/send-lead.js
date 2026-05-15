export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, contact, style, size, budget, date, comment, preview } = req.body;

  if (!name?.trim() || !contact?.trim()) {
    return res.status(400).json({ error: 'Name and contact are required' });
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT  = process.env.TELEGRAM_CHAT_ID;

  if (!TOKEN || !CHAT) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const text = [
    '🔥 *New InkVision Lead*',
    `👤 *Name:* ${name}`,
    `📱 *Contact:* ${contact}`,
    `🎨 *Style:* ${style || '—'}`,
    `📏 *Size:* ${size || '—'}`,
    `💰 *Budget:* ${budget || '—'}`,
    `📅 *Date:* ${date || '—'}`,
    `📝 *Comment:* ${comment || '—'}`,
  ].join('\n');

  const BASE = `https://api.telegram.org/bot${TOKEN}`;

  await fetch(`${BASE}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT, text, parse_mode: 'Markdown' }),
  });

  if (preview) {
    try {
      const base64Data = preview.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const form = new FormData();
      form.append('chat_id', CHAT);
      form.append('caption', '🖼 InkVision Preview');
      form.append('photo', new Blob([buffer], { type: 'image/jpeg' }), 'preview.jpg');
      await fetch(`${BASE}/sendPhoto`, { method: 'POST', body: form });
    } catch (_) {}
  }

  return res.status(200).json({ ok: true });
}
