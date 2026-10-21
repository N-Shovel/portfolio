import { SYSTEM_PROMPT } from './_knowledge.js';

// Models to try in order; the first that works is used.
const MODELS = (process.env.GEMINI_MODEL || 'gemini-flash-latest,gemini-2.5-flash,gemini-2.0-flash').split(',');
const MAX_MESSAGES = 12;
const MAX_CHARS = 500;
const FALLBACK = 'Sorry, I can\'t answer right now. You can email Rody at nimrodpala01@gmail.com.';

// Simple per-instance rate limit: 20 requests per IP per 10 minutes.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'The assistant isn\'t set up yet. Email Rody at nimrodpala01@gmail.com.' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'You\'re sending messages quickly. Please wait a few minutes, or email nimrodpala01@gmail.com.' });

  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-MAX_MESSAGES) : [];
  const contents = messages
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text.slice(0, MAX_CHARS) }],
    }));
  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Please send a question.' });
  }

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }, // thinking models spend part of this before replying
  });

  for (const model of MODELS) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model.trim()}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body,
      });
      if (r.status === 404) continue; // model retired or unavailable, try the next one
      const data = await r.json();
      if (!r.ok) {
        console.error('Gemini error', model, r.status, JSON.stringify(data).slice(0, 500));
        return res.status(502).json({ error: FALLBACK });
      }
      const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
      return res.status(200).json({ reply: reply || FALLBACK });
    } catch (err) {
      console.error('Gemini request failed', model, err);
    }
  }
  return res.status(502).json({ error: FALLBACK });
}
