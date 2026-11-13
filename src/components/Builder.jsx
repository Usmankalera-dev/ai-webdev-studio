import { EXAMPLES, THEMES, LAYOUTS, LAYOUT_LABELS, SECTIONS } from "../lib/coarena";
import Settings from "./Settings";

const LOADING_MESSAGES = [
  "Fable is building your website…",
  "Adding sections…",
  "Polishing the design…",
  "Writing the code…",
];

export default function Builder(props) {
  const {
    prompt,
    onPromptChange,
    theme,
    onThemeChange,
    layout,
    onLayoutChange,
    sections,
    onToggleSection,
    onGenerate,
    busy,
    loadingKind,
    elapsed,
    status,
    settingsProps,
  } = props;

  const onPromptKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onGenerate();
    }
  };

  const loadingMsg = LOADING_MESSAGES[Math.floor(elapsed / 4) % LOADING_MESSAGES.length];
  const showLoading = busy && (loadingKind === "generating" || loadingKind === "continuing" || loadingKind === "editing");

  return (
    <section className="panel builder" id="builder-panel">
      <h2>1. Describe your website</h2>

      <label className="field-label" htmlFor="prompt">
        What should the website be about?
      </label>
      <textarea
        id="prompt"
        rows="5"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={onPromptKeyDown}
        placeholder="e.g. A website for my bakery in Lahore — menu, prices in PKR, gallery of cakes, opening hours and contact form…"
      />
      <p className="hint">
        Apni website Roman Urdu ya Urdu me bhi describe kar sakte hain — jaise “mere restaurant
        ke liye ek khoobsurat website banao”.
      </p>

      <div className="examples">
        <span className="examples-label">Try an example:</span>
        {Object.keys(EXAMPLES).map((key) => (
          <button
            key={key}
            type="button"
            className="chip"
            onClick={() => onPromptChange(EXAMPLES[key])}
          >
            {key === "portfolio" ? "Personal Portfolio" : key === "restaurant" ? "Restaurant" : "Online Shop"}
          </button>
        ))}
      </div>

      <h2>2. Pick a style</h2>

      <p className="field-label">Theme colour</p>
      <div className="swatches">
        {THEMES.map((t) => (
          <label
            key={t.value}
            className={"swatch" + (theme === t.value ? " selected" : "")}
            style={{ "--c": t.color }}
            title={t.label}
          >
            <input
              type="radio"
              name="theme"
              value={t.value}
              checked={theme === t.value}
              onChange={() => onThemeChange(t.value)}
            />
            <span />
            {t.label}
          </label>
        ))}
      </div>

      <p className="field-label">Layout type</p>
      <div className="pills">
        {LAYOUTS.map((l) => (
          <label key={l} className={"pill" + (layout === l ? " selected" : "")}>
            <input
              type="radio"
              name="layout"
              value={l}
              checked={layout === l}
              onChange={() => onLayoutChange(l)}
            />
            {LAYOUT_LABELS[l]}
          </label>
        ))}
      </div>

      <p className="field-label">Sections to include</p>
      <div className="checks">
        {SECTIONS.map((s) => (
          <label key={s}>
            <input
              type="checkbox"
              value={s}
              checked={sections.includes(s)}
              onChange={() => onToggleSection(s)}
            />{" "}
            {s}
          </label>
        ))}
      </div>

      <button
        type="button"
        className={"btn primary big" + (busy ? " loading" : "")}
        onClick={onGenerate}
        disabled={busy}
      >
        {busy ? (
          <>
            <span className="spinner" />
            Generating your website…
          </>
        ) : (
          "✦ Generate Website"
        )}
      </button>
      <p className="kbd-hint">Tip: press Ctrl + Enter inside the description box to generate.</p>

      {showLoading && (
        <div className="loading-box" role="status" aria-live="polite">
          <span className="spinner" />
          {loadingMsg} <span className="elapsed">{elapsed}s</span>
          <span className="loading-sub">
            Usually takes 10–30 seconds — the model is doing the work.
          </span>
          <div className="loading-bar">
            <i />
          </div>
        </div>
      )}

      {status && !showLoading && (
        <div className={"status " + status.kind} role="status" aria-live="polite">
          {status.node}
        </div>
      )}

      <Settings {...settingsProps} />
    </section>
  );
}
