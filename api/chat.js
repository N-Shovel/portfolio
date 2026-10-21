import { SYSTEM_PROMPT } from './_knowledge.js';

// Models to try in order; the first that answers is used. Flash-Lite replies in about a second
// without "thinking"; Flash is a slower fallback whose free quota runs out sooner.
const MODELS = (process.env.GEMINI_MODEL || 'gemini-flash-lite-latest,gemini-flash-latest').split(',').map((m) => m.trim());
// Give up on a model after this long and try the next, so an overloaded model can't hang the chat.
const ATTEMPT_TIMEOUT_MS = 9000;
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
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }, // room for the fallback model's thinking
  });

  const attempts = [];
  for (const model of MODELS) {
    const started = Date.now();
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), ATTEMPT_TIMEOUT_MS);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body,
        signal: timeout.signal,
      });
      const data = await r.json();
      const took = Date.now() - started;
      if (!r.ok) {
        // e.g. 404 = model retired, 429 = quota used up, 503 = overloaded: try the next model.
        attempts.push(`${model}: ${r.status} in ${took}ms ${data.error?.message?.slice(0, 120) || ''}`);
        continue;
      }
      const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('').trim();
      const usage = data.usageMetadata || {};
      attempts.push(`${model} (${data.modelVersion}) ok in ${took}ms, ${usage.thoughtsTokenCount || 0} thinking tokens`);
      console.log('Gemini:', attempts.join(' | '));
      return res.status(200).json({ reply: reply || FALLBACK });
    } catch (err) {
      const reason = err.name === 'AbortError' ? 'timed out' : err.message;
      attempts.push(`${model}: ${reason} after ${Date.now() - started}ms`);
    } finally {
      clearTimeout(timer);
    }
  }
  console.error('Gemini failed:', attempts.join(' | '));
  return res.status(502).json({ error: FALLBACK });
}
