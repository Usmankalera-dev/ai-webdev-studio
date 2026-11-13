/* AI WebDev Studio — calls Fable via Coarena's free API to generate a complete website.
   The API key is stored ONLY in the browser's localStorage under
   'ai-webdev-fable-key'. No key is ever hardcoded in this file. */

(function () {
  "use strict";

  var STORAGE_KEY = "ai-webdev-fable-key";
  var MODEL_KEY = "ai-webdev-model";
  var HISTORY_KEY = "ai-webdev-history";
  var API_URL = "https://coarena.ai/api/v1/messages";
  var DEFAULT_MODEL = "claude-fable-5-2";
  var MAX_HISTORY = 5;
  var MODELS = [
    "claude-fable-5-2", "claude-fable-5-1", "claude-fable-5",
    "claude-sonnet-5-5", "claude-opus-5-5", "claude-haiku-5-5",
    "gemini-4-carbon", "gemini-3-8-flash", "gpt-6-luna"
  ];

  var SYSTEM_PROMPT =
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

  var CONTINUE_SYSTEM_PROMPT =
    "You are an expert front-end web developer. " +
    "The user gives you a standalone HTML document that was cut off in the middle. " +
    "Continue writing it from exactly where it stopped. " +
    "Rules: return ONLY the remaining HTML — do NOT repeat any part already written, no markdown fences, no backticks, no explanation, no commentary before or after. " +
    "Finish the document completely, ending with </html>.";

  var EDIT_SYSTEM_PROMPT =
    "You are an expert front-end web developer. " +
    "The user gives you a complete standalone HTML document plus ONE change they want. " +
    "Rules: return ONLY the full updated standalone HTML document — no markdown fences, no backticks, no explanation, no commentary before or after. " +
    "Keep everything else in the document the same unless the change requires it. " +
    "The document must stay fully self-contained: all CSS inside one <style> tag in <head>, all JavaScript inside one <script> tag at the end of <body>. " +
    "Keep the code compact: tight CSS, no repeated long class lists.";

  var TEST_SYSTEM_PROMPT =
    "Reply with exactly the text the user asks for, and nothing else.";

  var EXAMPLES = {
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
      "customer reviews, an about-the-brand section, and a contact and footer section."
  };

  /* ---------- element shortcuts ---------- */
  function $(id) { return document.getElementById(id); }

  var promptEl = $("prompt");
  var generateBtn = $("generateBtn");
  var statusEl = $("status");
  var apiKeyEl = $("apiKey");
  var keyStatusEl = $("keyStatus");
  var previewFrame = $("previewFrame");
  var emptyState = $("emptyState");
  var codeView = $("codeView");
  var copyBtn = $("copyBtn");
  var downloadBtn = $("downloadBtn");
  var tabPreview = $("tabPreview");
  var tabCode = $("tabCode");
  var previewPane = $("previewPane");
  var codePane = $("codePane");
  var continueBtn = $("continueBtn");
  var editBox = $("editBox");
  var editPromptEl = $("editPrompt");
  var applyEditBtn = $("applyEditBtn");
  var modelSelect = $("modelSelect");
  var sizeDesktopBtn = $("sizeDesktopBtn");
  var sizeMobileBtn = $("sizeMobileBtn");
  var historyList = $("historyList");
  var historyEmpty = $("historyEmpty");
  var clearHistoryBtn = $("clearHistoryBtn");

  var generatedHtml = "";
  var currentTitle = "";
  var previewSize = "desktop"; /* session only */

  /* ---------- key handling ---------- */
  function getKey() {
    try { return (localStorage.getItem(STORAGE_KEY) || "").trim(); }
    catch (e) { return ""; }
  }

  function setKey(value) {
    try { localStorage.setItem(STORAGE_KEY, value); return true; }
    catch (e) { return false; }
  }

  function clearKey() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
  }

  function showKeyState(message, ok) {
    keyStatusEl.textContent = message;
    keyStatusEl.className = "key-status " + (ok ? "ok" : "bad");
  }

  function refreshKeyUI() {
    var key = getKey();
    if (key) {
      apiKeyEl.value = key;
      showKeyState("✓ Key saved in this browser — it will be used automatically.", true);
    } else {
      apiKeyEl.value = "";
      showKeyState("", false);
    }
  }

  /* ---------- model picker ---------- */
  function getModel() {
    try {
      var m = (localStorage.getItem(MODEL_KEY) || "").trim();
      return MODELS.indexOf(m) !== -1 ? m : DEFAULT_MODEL;
    } catch (e) { return DEFAULT_MODEL; }
  }

  function setModel(value) {
    try { localStorage.setItem(MODEL_KEY, value); } catch (e) { /* storage unavailable */ }
  }

  /* Only Fable models support output_config.effort — other models may reject it. */
  function usesEffort(model) {
    return model.indexOf("claude-fable") === 0;
  }

  function refreshModelUI() {
    modelSelect.value = getModel();
  }

  /* ---------- status messages ---------- */
  function setStatus(message, kind) {
    statusEl.innerHTML = message;
    statusEl.className = "status " + (kind || "");
  }

  function setLoading(loading) {
    generateBtn.disabled = loading;
    generateBtn.classList.toggle("loading", loading);
    generateBtn.innerHTML = loading
      ? '<span class="spinner"></span>Generating your website…'
      : "✦ Generate Website";
    continueBtn.disabled = loading;
    applyEditBtn.disabled = loading;
  }

  function setContinueLoading(loading) {
    continueBtn.disabled = loading;
    generateBtn.disabled = loading;
    applyEditBtn.disabled = loading;
    continueBtn.textContent = loading ? "Continuing…" : "▶ Continue";
  }

  function setEditLoading(loading) {
    applyEditBtn.disabled = loading;
    generateBtn.disabled = loading;
    continueBtn.disabled = loading;
    applyEditBtn.textContent = loading ? "Applying…" : "Apply change";
  }

  function showContinue(show) {
    continueBtn.classList.toggle("hidden", !show);
  }

  /* ---------- option readers ---------- */
  function selectedRadio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function selectedSections() {
    var out = [];
    document.querySelectorAll("#sections input[type='checkbox']:checked").forEach(function (cb) {
      out.push(cb.value);
    });
    return out;
  }

  function buildUserPrompt() {
    var description = promptEl.value.trim();
    var theme = selectedRadio("theme");
    var layout = selectedRadio("layout");
    var sections = selectedSections();
    return (
      "Build a website with this description:\n" + description +
      "\n\nTheme colour (use as the main accent colour): " + theme +
      "\nLayout style: " + layout +
      "\nSections to include: " + (sections.length ? sections.join(", ") : "Hero, Services, Contact, Footer") +
      "\nMake it look premium and complete."
    );
  }

  /* ---------- model call via Coarena ----------
     Low effort keeps Fable's thinking small so most of the 16,384-token
     budget goes to the website code itself. Only Fable models get
     output_config — other models may reject it. If Coarena ever rejects
     the output_config field (400), retry once without it. */
  function callFable(key, systemPrompt, userText, maxTokens) {
    var model = getModel();
    var body = {
      model: model,
      max_tokens: maxTokens || 16384,
      messages: [{ role: "user", content: systemPrompt + "\n\n" + userText }]
    };
    if (usesEffort(model)) body.output_config = { effort: "low" };
    function send(b) {
      return fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + key,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(b)
      });
    }
    return send(body).then(function (res) {
      if (res.status === 400 && body.output_config) {
        var retryBody = { model: body.model, max_tokens: body.max_tokens, messages: body.messages };
        return send(retryBody);
      }
      return res;
    });
  }

  /* Concatenate text blocks only — a thinking block may come first, skip it. */
  function extractText(data) {
    try {
      var blocks = data.content;
      if (!blocks || !blocks.length) return "";
      return blocks.filter(function (b) { return b.type === "text"; })
                   .map(function (b) { return b.text || ""; }).join("");
    } catch (e) {
      return "";
    }
  }

  function stopReason(data) {
    try { return data.stop_reason || ""; } catch (e) { return ""; }
  }

  /* Strip markdown fences in case the model adds them anyway. */
  function cleanHtml(raw) {
    var text = (raw || "").trim();
    text = text.replace(/^```(?:html|HTML)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    return text.trim();
  }

  function apiErrorMessage(status) {
    if (status === 400) return "The request was rejected (400). Please try a shorter or simpler description.";
    if (status === 401 || status === 403) return "Invalid API key (error " + status + "). Please check your Fable (Coarena) key in Settings — create a free key at <a href='https://coarena.ai/account/api/keys' target='_blank' rel='noopener'>coarena.ai → API Keys</a>. Coarena is free: $5 of model use a day, no card needed. Keys expire after 90 days, so make a new one if yours stopped working.";
    if (status === 429) return "Daily free limit reached (429). Coarena gives $5 of free model use a day — it resets tomorrow. Please try again then.";
    return "Fable returned an error (HTTP " + status + "). Please try again.";
  }

  /* ---------- generate ---------- */
  function generate() {
    var key = getKey();
    if (!key) {
      setStatus(
        "No Fable API key saved yet. Add your key in <strong>Settings — Fable API Key</strong> below. " +
        "Get a free key at <a href='https://coarena.ai/account/api/keys' target='_blank' rel='noopener'>coarena.ai → API Keys</a>. " +
        "Coarena is free: $5 of model use a day, no card needed. Keys expire after 90 days.",
        "error"
      );
      $("settingsBox").open = true;
      apiKeyEl.focus();
      return;
    }

    var description = promptEl.value.trim();
    if (!description) {
      setStatus("Please describe your website first — or click one of the example prompts above.", "error");
      promptEl.focus();
      return;
    }

    setLoading(true);
    setStatus('<span class="spinner"></span>' + getModel() + ' is building your website… this usually takes 10–30 seconds.', "info");

    callFable(key, SYSTEM_PROMPT, buildUserPrompt(), 16384)
      .then(function (res) {
        if (!res.ok) {
          throw new Error(apiErrorMessage(res.status));
        }
        return res.json();
      })
      .then(function (data) {
        var html = cleanHtml(extractText(data));
        if (!html || html.length < 100 || html.toLowerCase().indexOf("<html") === -1) {
          throw new Error("Fable returned an empty or incomplete reply. Please try again, or rephrase your description.");
        }
        generatedHtml = html;
        currentTitle = description.slice(0, 50);
        showResult(html);
        addToHistory(currentTitle, html);
        if (stopReason(data) === "max_tokens") {
          showContinue(true);
          setStatus("✓ Your website is ready — but the output may have been cut off. Coarena allows at most 16,384 tokens per reply and Fable's thinking uses part of it. Press ▶ Continue below to finish it, or try a simpler description or fewer sections.", "success");
        } else {
          showContinue(false);
          setStatus("✓ Your website is ready — preview it, copy the code, or download it as index.html.", "success");
        }
      })
      .catch(function (err) {
        var msg = (err && err.message) || "Network error — please check your internet connection and try again.";
        if (err instanceof TypeError) {
          msg = "Network error — could not reach the Fable API. Check your internet connection and try again.";
        }
        setStatus(msg, "error");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  function showResult(html) {
    emptyState.classList.add("hidden");
    previewFrame.srcdoc = html;
    codeView.textContent = html;
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
    editBox.classList.remove("hidden");
    showTab("preview");
  }

  /* ---------- continue a cut-off generation ---------- */
  function continueGeneration() {
    var key = getKey();
    if (!key) {
      setStatus("No Fable API key saved yet. Add your key in <strong>Settings — Fable API Key</strong> below.", "error");
      return;
    }
    if (!generatedHtml) return;

    setContinueLoading(true);
    setStatus('<span class="spinner"></span>Continuing your website…', "info");

    callFable(key, CONTINUE_SYSTEM_PROMPT,
      "Here is the HTML document so far (it was cut off mid-document):\n\n" + generatedHtml +
      "\n\nContinue from exactly where it stopped.", 16384)
      .then(function (res) {
        if (!res.ok) {
          throw new Error(apiErrorMessage(res.status));
        }
        return res.json();
      })
      .then(function (data) {
        var chunk = cleanHtml(extractText(data));
        if (!chunk || chunk.length < 20) {
          throw new Error("Fable returned an empty continuation. Please press Continue again.");
        }
        generatedHtml = generatedHtml + chunk;
        showResult(generatedHtml);
        if (currentTitle) addToHistory(currentTitle, generatedHtml);
        if (stopReason(data) === "max_tokens") {
          showContinue(true);
          setStatus("✓ Continued — but it was cut off again. Press ▶ Continue to keep going.", "success");
        } else {
          showContinue(false);
          setStatus("✓ Your website is complete — preview it, copy the code, or download it as index.html.", "success");
        }
      })
      .catch(function (err) {
        var msg = (err && err.message) || "Network error — please check your internet connection and try again.";
        if (err instanceof TypeError) {
          msg = "Network error — could not reach the Fable API. Check your internet connection and try again.";
        }
        setStatus(msg, "error");
      })
      .finally(function () {
        setContinueLoading(false);
      });
  }

  /* ---------- edit the current website ---------- */
  function applyEdit() {
    var key = getKey();
    if (!key) {
      setStatus("No Fable API key saved yet. Add your key in <strong>Settings — Fable API Key</strong> below.", "error");
      return;
    }
    if (!generatedHtml) return;
    var change = editPromptEl.value.trim();
    if (!change) {
      setStatus("Please describe the change first.", "error");
      editPromptEl.focus();
      return;
    }

    setEditLoading(true);
    setStatus('<span class="spinner"></span>Applying your change…', "info");

    callFable(key, EDIT_SYSTEM_PROMPT,
      "Here is the current complete HTML document:\n\n" + generatedHtml +
      "\n\nRequested change:\n" + change, 16384)
      .then(function (res) {
        if (!res.ok) {
          throw new Error(apiErrorMessage(res.status));
        }
        return res.json();
      })
      .then(function (data) {
        var html = cleanHtml(extractText(data));
        if (!html || html.length < 100 || html.toLowerCase().indexOf("<html") === -1) {
          throw new Error("Fable returned an empty or incomplete reply. Please try again, or rephrase the change.");
        }
        generatedHtml = html;
        showResult(html);
        if (currentTitle) addToHistory(currentTitle, html);
        editPromptEl.value = "";
        if (stopReason(data) === "max_tokens") {
          showContinue(true);
          setStatus("✓ Change applied — but the output was cut off. Press ▶ Continue below to finish it.", "success");
        } else {
          showContinue(false);
          setStatus("✓ Change applied — preview it, copy the code, or download it as index.html.", "success");
        }
      })
      .catch(function (err) {
        var msg = (err && err.message) || "Network error — please check your internet connection and try again.";
        if (err instanceof TypeError) {
          msg = "Network error — could not reach the Fable API. Check your internet connection and try again.";
        }
        setStatus(msg, "error");
      })
      .finally(function () {
        setEditLoading(false);
      });
  }

  /* ---------- tabs ---------- */
  function showTab(which) {
    if (which === "code") {
      tabCode.classList.add("active");
      tabPreview.classList.remove("active");
      tabCode.setAttribute("aria-selected", "true");
      tabPreview.setAttribute("aria-selected", "false");
      codePane.classList.remove("hidden");
      previewPane.classList.add("hidden");
    } else {
      tabPreview.classList.add("active");
      tabCode.classList.remove("active");
      tabPreview.setAttribute("aria-selected", "true");
      tabCode.setAttribute("aria-selected", "false");
      previewPane.classList.remove("hidden");
      codePane.classList.add("hidden");
    }
  }

  /* ---------- copy & download ---------- */
  function copyCode() {
    if (!generatedHtml) return;
    function done() {
      copyBtn.textContent = "✓ Copied!";
      setTimeout(function () { copyBtn.textContent = "📋 Copy Code"; }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedHtml).then(done, function () { fallbackCopy(done); });
    } else {
      fallbackCopy(done);
    }
  }

  function fallbackCopy(done) {
    var ta = document.createElement("textarea");
    ta.value = generatedHtml;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); }
    catch (e) { setStatus("Copy failed in this browser — switch to the Code tab and select the code manually.", "error"); }
    document.body.removeChild(ta);
  }

  function downloadHtml() {
    if (!generatedHtml) return;
    var blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- recent websites (history) ---------- */
  function loadHistory() {
    try {
      var list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function saveHistoryList(list) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  function addToHistory(title, html) {
    var list = loadHistory();
    /* A continue/edit of the same site updates its entry instead of adding a duplicate. */
    if (list.length && list[0].title === title) {
      list[0].html = html;
      list[0].time = Date.now();
    } else {
      list.unshift({ title: title, time: Date.now(), html: html });
    }
    list = list.slice(0, MAX_HISTORY);
    saveHistoryList(list);
    renderHistory();
  }

  function formatHistoryTime(time) {
    try {
      return new Date(time).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  function renderHistory() {
    var list = loadHistory();
    historyList.textContent = "";
    historyEmpty.classList.toggle("hidden", list.length > 0);
    list.forEach(function (entry) {
      var li = document.createElement("li");
      var titleEl = document.createElement("span");
      titleEl.className = "history-title";
      titleEl.textContent = entry.title || "Untitled website";
      var timeEl = document.createElement("span");
      timeEl.className = "history-time";
      timeEl.textContent = formatHistoryTime(entry.time);
      var loadBtn = document.createElement("button");
      loadBtn.type = "button";
      loadBtn.className = "btn ghost small";
      loadBtn.textContent = "Load";
      loadBtn.addEventListener("click", function () {
        generatedHtml = entry.html;
        currentTitle = entry.title;
        showResult(entry.html);
        showContinue(false);
        setStatus("✓ Loaded “" + entry.title + "” — preview it, copy the code, or download it as index.html.", "success");
      });
      li.appendChild(titleEl);
      li.appendChild(timeEl);
      li.appendChild(loadBtn);
      historyList.appendChild(li);
    });
  }

  function clearHistory() {
    saveHistoryList([]);
    renderHistory();
  }

  /* ---------- preview size (session only) ---------- */
  function setPreviewSize(size) {
    previewSize = size;
    var mobile = size === "mobile";
    previewPane.classList.toggle("mobile", mobile);
    sizeDesktopBtn.classList.toggle("active", !mobile);
    sizeMobileBtn.classList.toggle("active", mobile);
  }

  /* ---------- settings actions ---------- */
  function saveKey() {
    var key = apiKeyEl.value.trim();
    if (!key) {
      showKeyState("Please paste your Fable API key first.", false);
      return;
    }
    if (setKey(key)) {
      showKeyState("✓ Key saved in this browser — it will be used automatically.", true);
      setStatus("✓ API key saved. You can generate now.", "success");
    } else {
      showKeyState("Could not save the key — this browser may block localStorage.", false);
    }
  }

  function testKey() {
    var key = apiKeyEl.value.trim() || getKey();
    if (!key) {
      showKeyState("Paste a key first, then press Test Key.", false);
      return;
    }
    showKeyState("Testing key…", false);
    callFable(key, TEST_SYSTEM_PROMPT, "Reply with exactly: OK", 16)
      .then(function (res) {
        if (!res.ok) throw new Error(apiErrorMessage(res.status));
        return res.json();
      })
      .then(function (data) {
        var text = extractText(data).trim();
        if (text) {
          showKeyState("✓ Key works — " + getModel() + " replied: “" + text.slice(0, 40) + "”.", true);
        } else {
          showKeyState("Key accepted, but the model returned an empty reply. Try again.", false);
        }
      })
      .catch(function (err) {
        var msg = (err && err.message) ? err.message.replace(/<[^>]*>/g, "") : "Network error.";
        showKeyState("✗ " + msg, false);
      });
  }

  /* ---------- wire up ---------- */
  generateBtn.addEventListener("click", generate);
  continueBtn.addEventListener("click", continueGeneration);
  applyEditBtn.addEventListener("click", applyEdit);
  clearHistoryBtn.addEventListener("click", clearHistory);
  sizeDesktopBtn.addEventListener("click", function () { setPreviewSize("desktop"); });
  sizeMobileBtn.addEventListener("click", function () { setPreviewSize("mobile"); });
  modelSelect.addEventListener("change", function () {
    setModel(modelSelect.value);
    setStatus("Model set to " + modelSelect.value + ".", "success");
  });

  editPromptEl.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      applyEdit();
    }
  });

  promptEl.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      promptEl.value = EXAMPLES[chip.getAttribute("data-example")] || "";
      promptEl.focus();
      setStatus("", "");
    });
  });

  /* keep the selected pill / swatch highlighted */
  document.querySelectorAll(".swatch input, .pill input").forEach(function (radio) {
    radio.addEventListener("change", function () {
      var group = radio.closest(".swatches, .pills");
      group.querySelectorAll("label").forEach(function (l) { l.classList.remove("selected"); });
      radio.closest("label").classList.add("selected");
    });
  });

  tabPreview.addEventListener("click", function () { showTab("preview"); });
  tabCode.addEventListener("click", function () { showTab("code"); });
  copyBtn.addEventListener("click", copyCode);
  downloadBtn.addEventListener("click", downloadHtml);

  $("saveKeyBtn").addEventListener("click", saveKey);
  $("testKeyBtn").addEventListener("click", testKey);
  $("clearKeyBtn").addEventListener("click", function () {
    clearKey();
    apiKeyEl.value = "";
    showKeyState("Key removed from this browser.", false);
  });
  $("toggleKey").addEventListener("click", function () {
    apiKeyEl.type = apiKeyEl.type === "password" ? "text" : "password";
  });

  /* auto-fill a saved key and model on every visit, and show saved history */
  refreshKeyUI();
  refreshModelUI();
  renderHistory();
})();
