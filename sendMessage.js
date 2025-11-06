// sendMessage.js
// Simple Express server to forward messages to a Discord webhook.
// IMPORTANT: paste your webhook URL into DISCORD_WEBHOOK before deploying.
//
// Usage (local):
// 1. npm init -y
// 2. npm install express node-fetch cors
// 3. node sendMessage.js
// 4. POST JSON { "username": "...", "message": "..." } to http://localhost:3000/send
//
// For Vercel serverless you should use a file under /api/sendMessage.js and export default.
// This file is intended for local testing or generic Node hosting.

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// === PUT YOUR WEBHOOK HERE ===
// Replace the string below with your Discord webhook URL before running/deploying.
const DISCORD_WEBHOOK = 'PASTE_YOUR_DISCORD_WEBHOOK_HERE';

function buildDiscordPayload(username, message) {
  const user = username && username.trim() ? username.trim() : 'Anônimo';
  const safeMessage = (message || '').trim() || '[sem mensagem]';
  const contentLines = [
    '⚡ **Novo usuário do NK Methods!**',
    `👤 **Nome/Nick:** ${user}`,
    '💬 **Mensagem:**',
    '```',
    safeMessage,
    '```'
  ];
  return { content: contentLines.join('\n') };
}

app.post('/send', async (req, res) => {
  try {
    if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK === 'PASTE_YOUR_DISCORD_WEBHOOK_HERE') {
      return res.status(400).json({ ok: false, error: 'Webhook não configurada. Edite sendMessage.js e cole sua webhook.' });
    }

    const { username, message } = req.body ?? {};
    const payload = buildDiscordPayload(username, message);

    const resp = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text().catch(()=>'');
      return res.status(502).json({ ok: false, status: resp.status, statusText: resp.statusText, body: text });
    }

    // Discord returns 204 No Content on success
    return res.json({ ok: true, message: 'Enviado ao Discord (via webhook).' });
  } catch (err) {
    console.error('Erro ao enviar webhook:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`sendMessage server running on port ${PORT}`));
