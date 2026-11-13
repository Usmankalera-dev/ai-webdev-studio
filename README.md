# AI WebDev Studio

Describe a website in plain words — Fable (via Coarena's free API) generates the complete code with a live preview.

## How it works

1. Open `index.html` (or the live GitHub Pages site).
2. Add your Fable API key in **Settings** (get a free one at https://coarena.ai/account/api/keys). The key is stored only in your own browser's localStorage and is never sent anywhere except Coarena's API.
3. Describe the website you want (English, Roman Urdu or Urdu), pick a theme, layout and sections, then click **Generate Website**.
4. Preview it live, copy the code, or download it as `index.html`.

## Features

- 5 theme colours, 4 layouts, 6 optional sections
- 3 one-click examples: Personal Portfolio, Restaurant, Online Shop
- Live preview + Code tabs, Copy Code, Download HTML
- Test Key button in Settings
- **Model picker** in Settings (Fable 5.2/5.1/5, Sonnet, Opus, Haiku, Gemini Carbon/Flash, GPT-6 Luna) — saved in your browser
- **▶ Continue** button: if a generation is cut off at the 16,384-token limit, it picks up exactly where it stopped
- **Edit this website**: describe a change and the model updates the full site
- **Recent websites**: your last 5 generated sites, saved in your browser — Load any of them back
- **Desktop / Mobile preview toggle**: check how the site looks on a phone (390px)

## Notes

- The app calls Fable (claude-fable-5-2) through **Coarena's free API** (https://coarena.ai/api/v1/messages, Anthropic-compatible, Bearer auth): **$5 of model use a day, free — no card needed**, 30 requests/minute. Keys expire after 90 days, so make a new one if yours stops working.
- No API key is stored in this repository. Never commit a key.

Built by Usman Kalera — https://usmankalera-dev.github.io/portfolio/
