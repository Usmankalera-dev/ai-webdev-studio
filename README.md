# AI WebDev Studio

Describe a website in plain words — Fable (via Coarena's free API) generates the complete code with a live preview.

Built with **React + Vite**. The live site serves the built output (`index.html` + `assets/` at the repo root).

## How it works

1. Open the live GitHub Pages site (or run it locally — see below).
2. Add your Fable API key in **Settings** (get a free one at https://coarena.ai/account/api/keys). The key is stored only in your own browser's localStorage and is never sent anywhere except Coarena's API.
3. Describe the website you want (English, Roman Urdu or Urdu), pick a theme, layout and sections, then click **Generate Website**.
4. Preview it live, copy the code, or download it as `index.html`.

## Features

- 3-step progress: 1 Describe → 2 Generate → 3 Preview & Download
- **Choose your AI model**: a grid of 9 clickable model cards (Fable 5.2/5.1/5, Sonnet, Opus, Haiku, Gemini Carbon/Flash, GPT-6 Luna) with best-for notes, speed dots and the real model id — free via Coarena
- Friendly loading state with elapsed seconds and rotating progress messages
- 5 theme colours, 4 layouts, 6 optional sections
- 3 one-click examples: Personal Portfolio, Restaurant, Online Shop
- Live preview + Code tabs, Copy Code, Download HTML
- Test Key button in Settings, plus a **usage meter** ("Today's free use: $X of $5")
- Stats row under the hero: 9 AI models • Free $5/day • No sign-up • Download & host anywhere
- **▶ Continue** button: if a generation is cut off at the 16,384-token limit, it picks up exactly where it stopped
- **Edit this website**: describe a change and the model updates the full site
- **Recent websites**: your last 5 generated sites, saved in your browser — Load any of them back
- **Desktop / Mobile preview toggle**: check how the site looks on a phone (390px)
- Sticky Generate button at the bottom on mobile

## Develop

```bash
npm install
npm run dev     # local dev server
npm run build   # builds to dist/, then copy dist/* to the repo root for GitHub Pages
```

The Vite entry is `src/index.html` (project root is `src/` in `vite.config.js`) and `base` is
`'./'` so assets load under the GitHub Pages subpath `/ai-webdev-studio/`. After building,
copy `dist/index.html` over the repo-root `index.html` and `dist/assets/*` into `assets/`
(the built filenames are hashed, so no `?v=` query is needed).

## Notes

- The app calls Fable (claude-fable-5-2) through **Coarena's free API** (https://coarena.ai/api/v1/messages, Anthropic-compatible, Bearer auth): **$5 of model use a day, free — no card needed**, 30 requests/minute. Keys expire after 90 days, so make a new one if yours stops working.
- React makes the tool's UI smoother and easier to extend; generation speed itself still depends on the model (usually 10–30 seconds).
- No API key is stored in this repository. Never commit a key.
- `app.js` / `styles.css` are leftovers from the old vanilla-JS version and are no longer used.

Built by Usman Kalera — https://usmankalera-dev.github.io/portfolio/
