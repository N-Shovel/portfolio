// Theme toggle: follows the OS until the visitor picks one, then remembers it.
const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function currentTheme() {
  return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
}

function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 't' && !e.target.closest('input, textarea')) toggleTheme();
});

document.getElementById('year').textContent = new Date().getFullYear();

// Terminal typing effect in the hero.
const lines = [
  ['$ ', 'whoami'],
  ['', 'nimrod "rody" pala'],
  ['$ ', 'cat interests.txt'],
  ['', 'full-stack web · c/c++ · 3d · games'],
  ['$ ', 'echo $NEXT'],
  ['', 'python → robotics'],
];
const typed = document.getElementById('typed');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function typeLines() {
  let html = '';
  for (const [prefix, text] of lines) {
    const pre = prefix ? `<span class="k">${prefix}</span>` : '';
    if (reduceMotion) { html += pre + escapeHtml(text) + '\n'; continue; }
    for (let i = 1; i <= text.length; i++) {
      typed.innerHTML = html + pre + escapeHtml(text.slice(0, i)) + '▌';
      await new Promise((r) => setTimeout(r, prefix ? 55 : 18));
    }
    html += pre + escapeHtml(text) + '\n';
    await new Promise((r) => setTimeout(r, 300));
  }
  typed.innerHTML = html;
}
typeLines();

// Reveal sections on scroll.
const revealEls = document.querySelectorAll('.section-title, .about-grid, .skill-card, .project, .mini, .contact-card');
revealEls.forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach((el) => io.observe(el));

// Chatbot.
const chat = document.getElementById('chat');
const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSuggest = document.getElementById('chatSuggest');
const sendBtn = chatForm.querySelector('button');
const history = [];

// Turn [label](url) and bare URLs into links, building DOM nodes so no HTML is injected.
function renderWithLinks(el, text) {
  const pattern = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|((?:https?:\/\/|mailto:)[^\s)]+)/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    el.append(text.slice(last, m.index));
    const url = m[2] || m[3];
    const a = document.createElement('a');
    a.href = url;
    a.textContent = m[1] || url.replace(/^(https?:\/\/|mailto:)/, '').replace(/\/$/, '');
    if (!url.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
    el.append(a);
    last = m.index + m[0].length;
  }
  el.append(text.slice(last));
}

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  if (role === 'bot') renderWithLinks(div, text); else div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

function openChat() {
  chat.hidden = false;
  if (!chatLog.children.length) {
    addMessage('bot', "Hi! I'm Rody's assistant. Ask me about his projects, skills, or how to hire him for a commission.");
  }
  chatInput.focus();
}

document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => {
  if (chat.hidden) openChat(); else if (b.id === 'chatFab') chat.hidden = true;
}));
document.getElementById('chatClose').addEventListener('click', () => { chat.hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') chat.hidden = true; });

chatSuggest.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') send(e.target.textContent);
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  send(chatInput.value);
});

async function send(text) {
  text = text.trim();
  if (!text || sendBtn.disabled) return;
  chatInput.value = '';
  chatSuggest.hidden = true;
  addMessage('user', text);
  history.push({ role: 'user', text });

  sendBtn.disabled = true;
  const typing = addMessage('bot typing', 'thinking…');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) }),
    });
    const data = await res.json().catch(() => ({}));
    const reply = data.reply || data.error || 'Sorry, something went wrong. You can email Rody at nimrodpala01@gmail.com.';
    typing.remove();
    addMessage('bot', reply);
    if (res.ok && data.reply) history.push({ role: 'model', text: data.reply });
    else history.pop();
  } catch (err) {
    typing.remove();
    history.pop();
    addMessage('bot', "I couldn't connect just now. You can reach Rody directly at nimrodpala01@gmail.com.");
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}
