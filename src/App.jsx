import { useCallback, useEffect, useState } from "react";
import {
  SYSTEM_PROMPT,
  CONTINUE_SYSTEM_PROMPT,
  EDIT_SYSTEM_PROMPT,
  TEST_SYSTEM_PROMPT,
  GENERATE_MAX_TOKENS,
  TEST_MAX_TOKENS,
  DEFAULT_SECTIONS,
  buildUserPrompt,
  callModel,
  extractText,
  stopReason,
  cleanHtml,
  getKey,
  setKey,
  clearKey,
  getModel,
  setModel,
  loadHistory,
  saveHistoryList,
  fetchUsage,
  MAX_HISTORY,
} from "./lib/coarena";
import Steps from "./components/Steps";
import Builder from "./components/Builder";
import Output from "./components/Output";
import StickyBar from "./components/StickyBar";

const COARENA_KEYS_URL = "https://coarena.ai/account/api/keys";

function NoKeyStatus() {
  return (
    <>
      No Fable API key saved yet. Add your key in <strong>Settings — Fable API Key</strong> below.{" "}
      Get a free key at{" "}
      <a href={COARENA_KEYS_URL} target="_blank" rel="noopener">
        coarena.ai → API Keys
      </a>
      . Coarena is free: $5 of model use a day, no card needed. Keys expire after 90 days.
    </>
  );
}

function apiErrorNode(status) {
  if (status === 400)
    return "The request was rejected (400). Please try a shorter or simpler description.";
  if (status === 401 || status === 403)
    return (
      <>
        Invalid API key (error {status}). Please check your Fable (Coarena) key in Settings —
        create a free key at{" "}
        <a href={COARENA_KEYS_URL} target="_blank" rel="noopener">
          coarena.ai → API Keys
        </a>
        . Coarena is free: $5 of model use a day, no card needed. Keys expire after 90 days, so
        make a new one if yours stopped working.
      </>
    );
  if (status === 429)
    return "Daily free limit reached (429). Coarena gives $5 of free model use a day — it resets tomorrow. Please try again then.";
  return `Fable returned an error (HTTP ${status}). Please try again.`;
}

function apiErrorText(status) {
  if (status === 400)
    return "The request was rejected (400). Please try a shorter or simpler description.";
  if (status === 401 || status === 403)
    return `Invalid API key (error ${status}). Please check your Fable (Coarena) key in Settings — create a free key at coarena.ai → API Keys. Coarena is free: $5 of model use a day, no card needed. Keys expire after 90 days.`;
  if (status === 429)
    return "Daily free limit reached (429). Coarena gives $5 of free model use a day — it resets tomorrow. Please try again then.";
  return `Fable returned an error (HTTP ${status}). Please try again.`;
}

function networkMessage(err) {
  const msg =
    (err && err.message) || "Network error — please check your internet connection and try again.";
  if (err instanceof TypeError)
    return "Network error — could not reach the Fable API. Check your internet connection and try again.";
  return msg;
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("Amber (#f0a832)");
  const [layout, setLayout] = useState("Modern");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState({ msg: "", ok: false });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModelState] = useState(getModel());
  const [usage, setUsage] = useState(null);

  const [generatedHtml, setGeneratedHtml] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [showContinue, setShowContinue] = useState(false);
  const [tab, setTab] = useState("preview");
  const [previewSize, setPreviewSize] = useState("desktop");
  const [history, setHistory] = useState([]);
  const [editPrompt, setEditPrompt] = useState("");
  const [copyLabel, setCopyLabel] = useState("📋 Copy Code");

  // busy: null | "generating" | "continuing" | "editing" | "testing"
  const [busy, setBusy] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState(null);

  const currentStep = generatedHtml ? 3 : busy ? 2 : 1;

  /* ---------- usage meter (silent on failure) ---------- */
  const refreshUsage = useCallback(async (key) => {
    if (!key) {
      setUsage(null);
      return;
    }
    try {
      const u = await fetchUsage(key);
      if (u) setUsage(u);
    } catch (e) {
      /* hide the meter silently */
    }
  }, []);

  /* ---------- init from localStorage (same keys as the old app) ---------- */
  useEffect(() => {
    const key = getKey();
    if (key) {
      setApiKey(key);
      setKeyStatus({
        msg: "✓ Key saved in this browser — it will be used automatically.",
        ok: true,
      });
      refreshUsage(key);
    }
    setHistory(loadHistory());
  }, [refreshUsage]);

  /* ---------- elapsed-seconds timer while a long job runs ---------- */
  useEffect(() => {
    if (!busy || busy === "testing") return undefined;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [busy]);

  /* ---------- history ---------- */
  const addToHistory = useCallback((title, html) => {
    setHistory((prev) => {
      let list = [...prev];
      if (list.length && list[0].title === title) {
        list[0] = { ...list[0], html, time: Date.now() };
      } else {
        list.unshift({ title, time: Date.now(), html });
      }
      list = list.slice(0, MAX_HISTORY);
      saveHistoryList(list);
      return list;
    });
  }, []);

  const loadHistoryEntry = (entry) => {
    setGeneratedHtml(entry.html);
    setCurrentTitle(entry.title);
    setShowContinue(false);
    setTab("preview");
    setStatus({
      kind: "success",
      node: (
        <>
          ✓ Loaded “{entry.title}” — preview it, copy the code, or download it as index.html.
        </>
      ),
    });
    document.getElementById("output-panel")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearHistory = () => {
    saveHistoryList([]);
    setHistory([]);
  };

  /* ---------- result handling ---------- */
  const showResult = (html) => {
    setGeneratedHtml(html);
    setTab("preview");
  };

  /* ---------- generate ---------- */
  const generate = async () => {
    const key = getKey();
    if (!key) {
      setStatus({ kind: "error", node: <NoKeyStatus /> });
      setSettingsOpen(true);
      document.getElementById("apiKey")?.focus();
      return;
    }
    const description = prompt.trim();
    if (!description) {
      setStatus({
        kind: "error",
        node: "Please describe your website first — or click one of the example prompts above.",
      });
      document.getElementById("prompt")?.focus();
      return;
    }

    setBusy("generating");
    setStatus({
      kind: "info",
      node: `${model} is building your website… this usually takes 10–30 seconds.`,
    });

    try {
      const res = await callModel(
        key,
        model,
        SYSTEM_PROMPT,
        buildUserPrompt(description, theme, layout, sections),
        GENERATE_MAX_TOKENS
      );
      if (!res.ok) throw new Error(apiErrorText(res.status));
      const data = await res.json();
      const html = cleanHtml(extractText(data));
      if (!html || html.length < 100 || html.toLowerCase().indexOf("<html") === -1) {
        throw new Error(
          "Fable returned an empty or incomplete reply. Please try again, or rephrase your description."
        );
      }
      const title = description.slice(0, 50);
      setCurrentTitle(title);
      showResult(html);
      addToHistory(title, html);
      if (stopReason(data) === "max_tokens") {
        setShowContinue(true);
        setStatus({
          kind: "success",
          node: "✓ Your website is ready — but the output may have been cut off. Coarena allows at most 16,384 tokens per reply and Fable's thinking uses part of it. Press ▶ Continue below to finish it, or try a simpler description or fewer sections.",
        });
      } else {
        setShowContinue(false);
        setStatus({
          kind: "success",
          node: "✓ Your website is ready — preview it, copy the code, or download it as index.html.",
        });
      }
    } catch (err) {
      setStatus({ kind: "error", node: networkMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  /* ---------- continue a cut-off generation ---------- */
  const continueGeneration = async () => {
    const key = getKey();
    if (!key) {
      setStatus({ kind: "error", node: <NoKeyStatus /> });
      return;
    }
    if (!generatedHtml) return;

    setBusy("continuing");
    setStatus({ kind: "info", node: "Continuing your website…" });

    try {
      const res = await callModel(
        key,
        model,
        CONTINUE_SYSTEM_PROMPT,
        "Here is the HTML document so far (it was cut off mid-document):\n\n" +
          generatedHtml +
          "\n\nContinue from exactly where it stopped.",
        GENERATE_MAX_TOKENS
      );
      if (!res.ok) throw new Error(apiErrorText(res.status));
      const data = await res.json();
      const chunk = cleanHtml(extractText(data));
      if (!chunk || chunk.length < 20) {
        throw new Error("Fable returned an empty continuation. Please press Continue again.");
      }
      const full = generatedHtml + chunk;
      showResult(full);
      if (currentTitle) addToHistory(currentTitle, full);
      if (stopReason(data) === "max_tokens") {
        setShowContinue(true);
        setStatus({
          kind: "success",
          node: "✓ Continued — but it was cut off again. Press ▶ Continue to keep going.",
        });
      } else {
        setShowContinue(false);
        setStatus({
          kind: "success",
          node: "✓ Your website is complete — preview it, copy the code, or download it as index.html.",
        });
      }
    } catch (err) {
      setStatus({ kind: "error", node: networkMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  /* ---------- edit the current website ---------- */
  const applyEdit = async () => {
    const key = getKey();
    if (!key) {
      setStatus({ kind: "error", node: <NoKeyStatus /> });
      return;
    }
    if (!generatedHtml) return;
    const change = editPrompt.trim();
    if (!change) {
      setStatus({ kind: "error", node: "Please describe the change first." });
      document.getElementById("editPrompt")?.focus();
      return;
    }

    setBusy("editing");
    setStatus({ kind: "info", node: "Applying your change…" });

    try {
      const res = await callModel(
        key,
        model,
        EDIT_SYSTEM_PROMPT,
        "Here is the current complete HTML document:\n\n" +
          generatedHtml +
          "\n\nRequested change:\n" +
          change,
        GENERATE_MAX_TOKENS
      );
      if (!res.ok) throw new Error(apiErrorText(res.status));
      const data = await res.json();
      const html = cleanHtml(extractText(data));
      if (!html || html.length < 100 || html.toLowerCase().indexOf("<html") === -1) {
        throw new Error(
          "Fable returned an empty or incomplete reply. Please try again, or rephrase the change."
        );
      }
      showResult(html);
      if (currentTitle) addToHistory(currentTitle, html);
      setEditPrompt("");
      if (stopReason(data) === "max_tokens") {
        setShowContinue(true);
        setStatus({
          kind: "success",
          node: "✓ Change applied — but the output was cut off. Press ▶ Continue below to finish it.",
        });
      } else {
        setShowContinue(false);
        setStatus({
          kind: "success",
          node: "✓ Change applied — preview it, copy the code, or download it as index.html.",
        });
      }
    } catch (err) {
      setStatus({ kind: "error", node: networkMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  /* ---------- settings actions ---------- */
  const saveKey = () => {
    const value = apiKey.trim();
    if (!value) {
      setKeyStatus({ msg: "Please paste your Fable API key first.", ok: false });
      return;
    }
    if (setKey(value)) {
      setKeyStatus({
        msg: "✓ Key saved in this browser — it will be used automatically.",
        ok: true,
      });
      setStatus({ kind: "success", node: "✓ API key saved. You can generate now." });
      refreshUsage(value);
    } else {
      setKeyStatus({ msg: "Could not save the key — this browser may block localStorage.", ok: false });
    }
  };

  const testKey = async () => {
    const value = apiKey.trim() || getKey();
    if (!value) {
      setKeyStatus({ msg: "Paste a key first, then press Test Key.", ok: false });
      return;
    }
    setBusy("testing");
    setKeyStatus({ msg: "Testing key…", ok: false });
    try {
      const res = await callModel(value, model, TEST_SYSTEM_PROMPT, "Reply with exactly: OK", TEST_MAX_TOKENS);
      if (!res.ok) throw new Error(apiErrorText(res.status));
      const data = await res.json();
      const text = extractText(data).trim();
      if (text) {
        setKeyStatus({
          msg: `✓ Key works — ${model} replied: “${text.slice(0, 40)}”.`,
          ok: true,
        });
      } else {
        setKeyStatus({ msg: "Key accepted, but the model returned an empty reply. Try again.", ok: false });
      }
    } catch (err) {
      const msg = err instanceof TypeError ? "Network error." : err.message || "Network error.";
      setKeyStatus({ msg: "✗ " + msg, ok: false });
    } finally {
      setBusy(null);
    }
  };

  const clearKeyHandler = () => {
    clearKey();
    setApiKey("");
    setUsage(null);
    setKeyStatus({ msg: "Key removed from this browser.", ok: false });
  };

  const onModelChange = (value) => {
    setModel(value);
    setModelState(value);
    setStatus({ kind: "success", node: `Model set to ${value}.` });
  };

  /* ---------- copy & download ---------- */
  const copyCode = () => {
    if (!generatedHtml) return;
    const done = () => {
      setCopyLabel("✓ Copied!");
      setTimeout(() => setCopyLabel("📋 Copy Code"), 2000);
    };
    const fallbackCopy = () => {
      const ta = document.createElement("textarea");
      ta.value = generatedHtml;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        setStatus({
          kind: "error",
          node: "Copy failed in this browser — switch to the Code tab and select the code manually.",
        });
      }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedHtml).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
  };

  const downloadHtml = () => {
    if (!generatedHtml) return;
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const toggleSection = (s) =>
    setSections((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const busyBool = busy !== null;

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <div className="brand-block">
            <a className="brand" href="#">
              AI WebDev <span>Studio</span>
            </a>
            <span className="brand-sub">by Usman Kalera • Rakhzaar Tech</span>
          </div>
          <span className="badge">Powered by Fable via Coarena</span>
        </div>
      </header>

      <main className="wrap">
        <section className="intro">
          <h1>
            Describe it. <span>Your AI builds it.</span>
          </h1>
          <p className="lead">
            Your own AI website studio — pick one of 9 AI models, describe the site you want in
            English, Roman Urdu or Urdu, and get a complete, ready-to-use website.
          </p>
          <div className="stats-row" aria-label="Platform facts">
            <span className="stat-chip">
              <strong>9</strong> AI models
            </span>
            <span className="stat-chip">
              <strong>Free</strong> $5/day
            </span>
            <span className="stat-chip">
              <strong>No</strong> sign-up
            </span>
            <span className="stat-chip">
              <strong>Download</strong> &amp; host anywhere
            </span>
          </div>
        </section>

        <Steps currentStep={currentStep} />
        <p className="how-line">
          How it works: <strong>Describe</strong> → <strong>Generate</strong> →{" "}
          <strong>Preview &amp; Download</strong> — your site, ready in under a minute.
        </p>

        <div className="layout">
          <Builder
            prompt={prompt}
            onPromptChange={setPrompt}
            theme={theme}
            onThemeChange={setTheme}
            layout={layout}
            onLayoutChange={setLayout}
            sections={sections}
            onToggleSection={toggleSection}
            model={model}
            onModelChange={onModelChange}
            onGenerate={generate}
            busy={busyBool}
            loadingKind={busy}
            elapsed={elapsed}
            status={status}
            settingsProps={{
              apiKey,
              onApiKeyChange: setApiKey,
              showKey,
              onToggleShowKey: () => setShowKey((v) => !v),
              onSaveKey: saveKey,
              onTestKey: testKey,
              onClearKey: clearKeyHandler,
              keyStatus,
              usage,
              settingsOpen,
              onToggleSettings: setSettingsOpen,
              busy: busyBool,
            }}
          />

          <Output
            generatedHtml={generatedHtml}
            tab={tab}
            onTabChange={setTab}
            copyLabel={copyLabel}
            onCopy={copyCode}
            onDownload={downloadHtml}
            previewSize={previewSize}
            onPreviewSize={setPreviewSize}
            showContinue={showContinue}
            onContinue={continueGeneration}
            editPrompt={editPrompt}
            onEditPromptChange={setEditPrompt}
            onApplyEdit={applyEdit}
            history={history}
            onLoadHistory={loadHistoryEntry}
            onClearHistory={clearHistory}
            busy={busyBool}
            continueBusy={busy === "continuing"}
            editBusy={busy === "editing"}
          />
        </div>

        <footer className="foot">
          <p>
            <strong>Built by Usman Kalera</strong> — Founder &amp; CEO, Rakhzaar Tech
          </p>
          <p className="foot-links">
            <a
              href="https://usmankalera-dev.github.io/portfolio/"
              target="_blank"
              rel="noopener"
            >
              Portfolio
            </a>
            {" • "}
            <a
              href="https://github.com/Usmankalera-dev/ai-webdev-studio"
              target="_blank"
              rel="noopener"
            >
              GitHub Repo
            </a>
          </p>
          <p>
            Your Fable API key never leaves your browser except to call Coarena&rsquo;s API.
            Generated sites are standalone HTML files you can host anywhere, including GitHub
            Pages.
          </p>
        </footer>
      </main>

      <StickyBar currentStep={currentStep} busy={busyBool} onGenerate={generate} />
    </>
  );
}
