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
  if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey && !e.target.closest('input, textarea')) toggleTheme();
});

document.getElementById('year').textContent = new Date().getFullYear();

// Reveal sections on scroll.
const revealEls = document.querySelectorAll('.item, .plain-list, .prose, .skills, .big-link');
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
