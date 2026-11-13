/* Shared logic for AI WebDev Studio — Fable via Coarena's free API.
   The API key is stored ONLY in the browser's localStorage under
   'ai-webdev-fable-key'. No key is ever hardcoded in this file. */

export const STORAGE_KEY = "ai-webdev-fable-key";
export const MODEL_KEY = "ai-webdev-model";
export const HISTORY_KEY = "ai-webdev-history";
export const API_URL = "https://coarena.ai/api/v1/messages";
export const LIMITS_URL = "https://coarena.ai/api/v1/limits";
export const DEFAULT_MODEL = "claude-fable-5-2";
export const MAX_HISTORY = 5;
export const GENERATE_MAX_TOKENS = 16384;
export const TEST_MAX_TOKENS = 16;

export const MODELS = [
  "claude-fable-5-2",
  "claude-fable-5-1",
  "claude-fable-5",
  "claude-sonnet-5-5",
  "claude-opus-5-5",
  "claude-haiku-5-5",
  "gemini-4-carbon",
  "gemini-3-8-flash",
  "gpt-6-luna",
];

/* Model cards shown in the "Choose your AI model" section. These are the
   platform's model lineup, served by Coarena (free, $5/day). They are not
   the user's own creations — the branding is about the product being his. */
export const MODEL_CARDS = [
  {
    id: "claude-fable-5-2",
    name: "Fable 5.2",
    bestFor: "Flagship — best for complete websites",
    badge: "Flagship",
    speed: 3,
  },
  {
    id: "claude-fable-5-1",
    name: "Fable 5.1",
    bestFor: "Flagship-class, slightly lighter than 5.2",
    badge: "Balanced",
    speed: 3,
  },
  {
    id: "claude-fable-5",
    name: "Fable 5",
    bestFor: "The original flagship — solid all-rounder",
    badge: "Balanced",
    speed: 3,
  },
  {
    id: "claude-sonnet-5-5",
    name: "Sonnet 5.5",
    bestFor: "Balanced quality and speed",
    badge: "Balanced",
    speed: 4,
  },
  {
    id: "claude-opus-5-5",
    name: "Opus 5.5",
    bestFor: "Most capable — complex, detailed sites",
    badge: "Most capable",
    speed: 2,
  },
  {
    id: "claude-haiku-5-5",
    name: "Haiku 5.5",
    bestFor: "Fastest — simple sites and quick drafts",
    badge: "Fast",
    speed: 5,
  },
  {
    id: "gemini-4-carbon",
    name: "Gemini Carbon",
    bestFor: "Creative ideas and fresh layouts",
    badge: "Balanced",
    speed: 3,
  },
  {
    id: "gemini-3-8-flash",
    name: "Gemini Flash",
    bestFor: "Fast drafts and quick iterations",
    badge: "Fast",
    speed: 5,
  },
  {
    id: "gpt-6-luna",
    name: "GPT-6 Luna",
    bestFor: "Versatile — good at a bit of everything",
    badge: "Balanced",
    speed: 4,
  },
];

export const SYSTEM_PROMPT =
  "You are an expert front-end web developer. " +
  "Generate ONE complete standalone HTML document for the website described by the user. " +
  "Rules: return ONLY the raw HTML code — no markdown fences, no backticks, no explanation, no commentary before or after. " +
  "The document must be fully self-contained: all CSS inside one <style> tag in <head>, all JavaScript inside one <script> tag at the end of <body>. " +
  "Use semantic HTML, a modern premium design, and make it fully responsive for mobile and desktop. " +
  "Use real-looking sample content (real names, real prices, real text) — never lorem ipsum. " +
  "Keep the code compact: tight CSS, no repeated long class lists, and a complete but concise page, so the whole document fits in one reply. " +
  "For images use direct https://images.unsplash.com photo URLs (with ?auto=format&fit=crop&w=1200&q=80). " +
  "Include a working mobile menu, smooth scrolling, and hover effects where sensible. " +
  "Write the visible content in the same language as the user's description (English, Urdu or Roman Urdu).";

export const CONTINUE_SYSTEM_PROMPT =
  "You are an expert front-end web developer. " +
  "The user gives you a standalone HTML document that was cut off in the middle. " +
  "Continue writing it from exactly where it stopped. " +
  "Rules: return ONLY the remaining HTML — do NOT repeat any part already written, no markdown fences, no backticks, no explanation, no commentary before or after. " +
  "Finish the document completely, ending with </html>.";

export const EDIT_SYSTEM_PROMPT =
  "You are an expert front-end web developer. " +
  "The user gives you a complete standalone HTML document plus ONE change they want. " +
  "Rules: return ONLY the full updated standalone HTML document — no markdown fences, no backticks, no explanation, no commentary before or after. " +
  "Keep everything else in the document the same unless the change requires it. " +
  "The document must stay fully self-contained: all CSS inside one <style> tag in <head>, all JavaScript inside one <script> tag at the end of <body>. " +
  "Keep the code compact: tight CSS, no repeated long class lists.";

export const TEST_SYSTEM_PROMPT =
  "Reply with exactly the text the user asks for, and nothing else.";

export const EXAMPLES = {
  portfolio:
    "A personal portfolio website for a freelance graphic designer named Ayesha Khan from Lahore. " +
    "Hero with her name and tagline, an About section, services (logo design, social media posts, branding), " +
    "a gallery of 6 projects, pricing packages, and a contact form.",
  restaurant:
    "A website for a desi restaurant called 'Lazeez Dastarkhwan' in Karachi. " +
    "Hero with appetising food imagery, about the restaurant, a menu with dishes and prices in PKR, " +
    "a gallery of signature dishes, opening hours, location, and a reservation / contact section.",
  shop:
    "An online shop for handmade leather bags. Hero banner with a strong offer, " +
    "a featured products grid with names and prices in PKR, product categories, " +
    "customer reviews, an about-the-brand section, and a contact and footer section.",
};

export const THEMES = [
  { value: "Amber (#f0a832)", label: "Amber", color: "#f0a832" },
  { value: "Emerald (#10b981)", label: "Emerald", color: "#10b981" },
  { value: "Sky (#38bdf8)", label: "Sky", color: "#38bdf8" },
  { value: "Rose (#fb7185)", label: "Rose", color: "#fb7185" },
  { value: "Violet (#a78bfa)", label: "Violet", color: "#a78bfa" },
];

export const LAYOUTS = ["Modern", "Minimal", "Bold and creative", "Classic"];
export const LAYOUT_LABELS = {
  Modern: "Modern",
  Minimal: "Minimal",
  "Bold and creative": "Bold",
  Classic: "Classic",
};

export const SECTIONS = ["Hero", "Services", "Gallery", "Pricing", "Contact", "Footer"];
export const DEFAULT_SECTIONS = ["Hero", "Services", "Contact", "Footer"];

/* ---------- localStorage helpers (same keys as the old app) ---------- */
export function getKey() {
  try {
    return (localStorage.getItem(STORAGE_KEY) || "").trim();
  } catch (e) {
    return "";
  }
}

export function setKey(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch (e) {
    return false;
  }
}

export function clearKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* storage unavailable */
  }
}

export function getModel() {
  try {
    const m = (localStorage.getItem(MODEL_KEY) || "").trim();
    return MODELS.includes(m) ? m : DEFAULT_MODEL;
  } catch (e) {
    return DEFAULT_MODEL;
  }
}

export function setModel(value) {
  try {
    localStorage.setItem(MODEL_KEY, value);
  } catch (e) {
    /* storage unavailable */
  }
}

/* Only Fable models support output_config.effort — other models may reject it. */
export function usesEffort(model) {
  return model.indexOf("claude-fable") === 0;
}

export function loadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

export function saveHistoryList(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    /* storage unavailable */
  }
}

/* ---------- model call via Coarena ----------
   Low effort keeps Fable's thinking small so most of the 16,384-token
   budget goes to the website code itself. Only Fable models get
   output_config — other models may reject it. If Coarena ever rejects
   the output_config field (400), retry once without it. */
export async function callModel(key, model, systemPrompt, userText, maxTokens) {
  const body = {
    model,
    max_tokens: maxTokens || GENERATE_MAX_TOKENS,
    messages: [{ role: "user", content: systemPrompt + "\n\n" + userText }],
  };
  if (usesEffort(model)) body.output_config = { effort: "low" };

  const send = (b) =>
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(b),
    });

  let res = await send(body);
  if (res.status === 400 && body.output_config) {
    const retryBody = { model: body.model, max_tokens: body.max_tokens, messages: body.messages };
    res = await send(retryBody);
  }
  return res;
}

/* Concatenate text blocks only — a thinking block may come first, skip it. */
export function extractText(data) {
  try {
    const blocks = data.content;
    if (!blocks || !blocks.length) return "";
    return blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text || "")
      .join("");
  } catch (e) {
    return "";
  }
}

export function stopReason(data) {
  try {
    return data.stop_reason || "";
  } catch (e) {
    return "";
  }
}

/* Strip markdown fences in case the model adds them anyway. */
export function cleanHtml(raw) {
  let text = (raw || "").trim();
  text = text.replace(/^```(?:html|HTML)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  return text.trim();
}

export function buildUserPrompt(description, theme, layout, sections) {
  return (
    "Build a website with this description:\n" +
    description +
    "\n\nTheme colour (use as the main accent colour): " +
    theme +
    "\nLayout style: " +
    layout +
    "\nSections to include: " +
    (sections.length ? sections.join(", ") : "Hero, Services, Contact, Footer") +
    "\nMake it look premium and complete."
  );
}

/* ---------- usage meter ----------
   GET /v1/limits with the saved key. The response shape is not strictly
   documented, so read the numbers tolerantly; return null when nothing
   usable comes back (the meter is then hidden silently). */
export async function fetchUsage(key) {
  const res = await fetch(LIMITS_URL, {
    method: "GET",
    headers: { Authorization: "Bearer " + key },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const pick = (obj, names) => {
    if (!obj || typeof obj !== "object") return null;
    for (const n of names) {
      const v = obj[n];
      if (typeof v === "number" && isFinite(v)) return v;
    }
    return null;
  };
  const used =
    pick(data, ["usd_today", "used_usd", "usage_usd", "usd_used", "spent_usd", "today_usd"]) ??
    pick(data.today, ["usd", "used", "spent"]) ??
    pick(data.usage, ["usd_today", "usd", "used", "spent"]) ??
    pick(data.daily, ["usd", "used", "spent"]);
  const limit =
    pick(data, ["usd_per_day", "daily_limit_usd", "limit_usd", "usd_limit"]) ??
    pick(data.limits, ["usd_per_day", "usd", "limit"]) ??
    5;
  if (used === null || used === undefined) return null;
  return { used, limit };
}

export function formatHistoryTime(time) {
  try {
    return new Date(time).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}
