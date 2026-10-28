import { useEffect, useRef, useState } from 'react';
import { EMAIL } from '../data.js';

const SUGGESTIONS = ['What has he built?', 'Is he available for work?', "What's his tech stack?"];
const GREETING = "Hi! I'm Rody's assistant. Ask me about his projects, skills, or how to hire him for a commission.";
// Questions a visitor can ask per page load; a refresh starts over. The server also rate-limits each IP.
const MAX_QUESTIONS = 10;
const LINK = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/|mailto:)[^\s)]+)/g;

// Turn [label](url) and bare URLs in a reply into links.
function withLinks(text) {
  const parts = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    parts.push(text.slice(last, m.index));
    const url = m[2] || m[3];
    const label = m[1] || url.replace(/^(https?:\/\/|mailto:)/, '').replace(/\/$/, '');
    const ext = url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener' };
    parts.push(<a key={m.index} href={url} {...ext} className="text-accent underline underline-offset-2">{label}</a>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

export default function Chat({ open, setOpen }) {
  const [messages, setMessages] = useState([{ role: 'model', text: GREETING }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const noteRef = useRef(null);
  const left = MAX_QUESTIONS - messages.filter((m) => m.role === 'user').length;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    (inputRef.current ?? noteRef.current)?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // Focus inside the closed panel drops to <body>; hand it back to whatever opened the chat.
      if (document.activeElement === document.body) (opener?.isConnected && opener !== document.body ? opener : buttonRef.current)?.focus();
    };
  }, [open, setOpen]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // Sending the last question swaps the input for a note; move focus there so it isn't lost.
  useEffect(() => {
    if (left <= 0) noteRef.current?.focus();
  }, [left]);

  // Show `log`, which ends with the visitor's question, and fetch the reply to it.
  async function ask(log) {
    setMessages(log);
    setBusy(true);
    let reply;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The greeting is UI only; don't send it to the model.
        body: JSON.stringify({ messages: log.slice(1).filter((m) => !m.error).slice(-12) }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json().catch(() => ({}));
      reply = data.reply ? { role: 'model', text: data.reply } : { role: 'model', text: data.error || `Sorry, something went wrong. You can email Rody at ${EMAIL}.`, error: true };
    } catch (err) {
      const text = err.name === 'TimeoutError'
        ? `That's taking too long right now. You can email Rody directly at ${EMAIL}.`
        : `I couldn't connect just now. You can reach Rody directly at ${EMAIL}.`;
      reply = { role: 'model', text, error: true };
    }
    setMessages([...log, reply]);
    setBusy(false);
    inputRef.current?.focus();
  }

  function send(text) {
    text = text.trim();
    if (!text || busy || left <= 0) return;
    setInput('');
    ask([...messages, { role: 'user', text }]);
  }

  // After a failed reply, drop the error and ask again; the question is already in the log.
  const retry = () => !busy && ask(messages.slice(0, -1));

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
        aria-controls="chat-panel"
        className="fixed right-5 bottom-5 z-40 grid size-12 cursor-pointer place-items-center rounded-full bg-accent text-bg shadow-lg transition-transform hover:scale-105"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      </button>

      {open && (
        <section id="chat-panel" aria-label="Chat with Rody's assistant" className="fixed right-5 bottom-20 z-50 flex h-[min(520px,calc(100vh-110px))] w-[min(360px,calc(100vw-32px))] flex-col overflow-hidden rounded-[14px] border border-line bg-bg shadow-2xl">
          <header className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div className="flex flex-col text-[0.93rem]">
              <strong className="font-semibold">Ask about Rody</strong>
              <span className="text-xs text-muted">AI assistant · may make mistakes</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="cursor-pointer text-muted hover:text-fg">✕</button>
          </header>

          <div ref={logRef} aria-live="polite" className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-[0.9rem] whitespace-pre-wrap break-words ${m.role === 'user' ? 'self-end bg-accent text-bg' : 'self-start bg-surface'}`}>
                {m.role === 'user' ? m.text : withLinks(m.text)}
                {m.error && i === messages.length - 1 && (
                  <button onClick={retry} className="mt-1.5 block cursor-pointer font-medium text-accent underline underline-offset-2">Try again</button>
                )}
              </div>
            ))}
            {busy && <div className="self-start rounded-xl bg-surface px-3 py-2 text-[0.9rem] text-muted">thinking…</div>}
          </div>

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="cursor-pointer rounded-full border border-line px-2.5 py-1 text-xs hover:bg-surface">{s}</button>
              ))}
            </div>
          )}

          {left > 0 ? (
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-line p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={left <= 3 ? `Ask a question… (${left} left)` : 'Ask a question…'}
                maxLength={500}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-[10px] border border-line bg-bg px-3 py-2 text-[0.92rem] outline-none focus:border-muted"
              />
              <button type="submit" disabled={busy} aria-label="Send" className="w-[38px] cursor-pointer rounded-[10px] bg-accent text-bg disabled:cursor-default disabled:opacity-40">↑</button>
            </form>
          ) : (
            <p ref={noteRef} tabIndex={-1} className="border-t border-line p-3 text-[0.9rem] text-muted outline-none">
              That's the last of {MAX_QUESTIONS} questions for this visit. For anything else, email Rody at{' '}
              <a href={`mailto:${EMAIL}`} className="text-accent underline underline-offset-2">{EMAIL}</a>.
            </p>
          )}
        </section>
      )}
    </>
  );
}
