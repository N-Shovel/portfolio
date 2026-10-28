# Nimrod Pala · Portfolio

My personal portfolio site, with an AI assistant that answers visitors' questions about my work.

**Live:** https://nimrodpala.vercel.app

## Stack

- React 19 + Tailwind CSS v4, built with Vite. Dark and light themes.
- `src/data.js`: projects, skills and links shown on the page.
- `src/scene/sakura.js`: the background, a sakura tree beside the sea with falling petals, drawn on canvas.
- `src/ambient.js`: the optional ambient music, synthesized in the browser.
- `src/components/Chat.jsx`: the chat window. Visitors can ask `MAX_QUESTIONS` (10) questions per page load.
- `api/chat.js`: a Vercel serverless function that calls the Gemini API.
- `api/_knowledge.js`: what the assistant knows about me. Edit this file to change its answers.

## Setup

1. Add `GEMINI_API_KEY` in Vercel → Project → Settings → Environment Variables.
2. Optional: set `GEMINI_MODEL` to a comma-separated list of model names to try in order. The first one gets a second, fresh try before the others, and all attempts together stay under 22 seconds.

Run it locally with `npm install` then `vercel dev` (or `npm run dev` for the page without the chat API).

The chat API only answers requests from the site's own pages: it compares the `Origin` header with the host, so a test with curl needs e.g. `-H "Origin: http://localhost:3000"`.
