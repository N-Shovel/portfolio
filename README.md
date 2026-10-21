# Nimrod Pala · Portfolio

My personal portfolio site, with an AI assistant that answers visitors' questions about my work.

**Live:** https://nimrodpala.vercel.app

## Stack

- Plain HTML, CSS and JavaScript, with no build step. Dark and light themes.
- `api/chat.js`: a Vercel serverless function that calls the Gemini API.
- `api/_knowledge.js`: what the assistant knows about me. Edit this file to change its answers.

## Setup

1. Add `GEMINI_API_KEY` in Vercel → Project → Settings → Environment Variables.
2. Optional: set `GEMINI_MODEL` to a comma-separated list of model names to try in order.

Run it locally with `vercel dev`.
