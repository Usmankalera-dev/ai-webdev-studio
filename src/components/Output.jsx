import { formatHistoryTime } from "../lib/coarena";

export default function Output(props) {
  const {
    generatedHtml,
    tab,
    onTabChange,
    copyLabel,
    onCopy,
    onDownload,
    previewSize,
    onPreviewSize,
    showContinue,
    onContinue,
    editPrompt,
    onEditPromptChange,
    onApplyEdit,
    history,
    onLoadHistory,
    onClearHistory,
    busy,
    continueBusy,
    editBusy,
  } = props;

  const hasResult = Boolean(generatedHtml);

  const onEditKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onApplyEdit();
    }
  };

  return (
    <section className="panel output" id="output-panel">
      <div className="output-head">
        <h2>Your website</h2>
        <div className="tabs" role="tablist">
          <button
            type="button"
            className={"tab" + (tab === "preview" ? " active" : "")}
            role="tab"
            aria-selected={tab === "preview"}
            onClick={() => onTabChange("preview")}
          >
            Preview
          </button>
          <button
            type="button"
            className={"tab" + (tab === "code" ? " active" : "")}
            role="tab"
            aria-selected={tab === "code"}
            onClick={() => onTabChange("code")}
          >
            Code
          </button>
        </div>
      </div>

      <div className="actions">
        <button type="button" className="btn small" onClick={onCopy} disabled={!hasResult || busy}>
          {copyLabel}
        </button>
        <button type="button" className="btn small" onClick={onDownload} disabled={!hasResult || busy}>
          ⬇ Download index.html
        </button>
        <span className="size-toggle tabs">
          <button
            type="button"
            className={"tab" + (previewSize === "desktop" ? " active" : "")}
            onClick={() => onPreviewSize("desktop")}
          >
            🖥 Desktop
          </button>
          <button
            type="button"
            className={"tab" + (previewSize === "mobile" ? " active" : "")}
            onClick={() => onPreviewSize("mobile")}
          >
            📱 Mobile
          </button>
        </span>
      </div>

      {showContinue && (
        <button type="button" className="btn primary continue-btn" onClick={onContinue} disabled={busy}>
          {continueBusy ? "Continuing…" : "▶ Continue"}
        </button>
      )}

      {tab === "preview" && (
        <div className={"preview-pane" + (previewSize === "mobile" ? " mobile" : "")}>
          {hasResult && (
            <iframe
              title="Website preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={generatedHtml}
            />
          )}
          {!hasResult && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <p>
                Your generated website will appear here.
                <br />
                Describe it on the left and press <strong>Generate Website</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "code" && (
        <div className="code-pane">
          <pre>
            <code>{generatedHtml}</code>
          </pre>
        </div>
      )}

      {hasResult && (
        <div className="edit-box">
          <h3>✏️ Edit this website</h3>
          <label className="field-label" htmlFor="editPrompt">
            Describe a change
          </label>
          <textarea
            id="editPrompt"
            rows="2"
            value={editPrompt}
            onChange={(e) => onEditPromptChange(e.target.value)}
            onKeyDown={onEditKeyDown}
            placeholder="e.g. add a pricing table, change the theme to green, make the hero taller…"
          />
          <button type="button" className="btn small" onClick={onApplyEdit} disabled={busy}>
            {editBusy ? "Applying…" : "Apply change"}
          </button>
          <p className="hint-ur">Jaise “pricing table add kar do” — jo bhi change chahiye, likh dein.</p>
        </div>
      )}

      <div className="history-box">
        <div className="history-head">
          <h3>🕘 Recent websites</h3>
          <button type="button" className="btn ghost small" onClick={onClearHistory}>
            Clear
          </button>
        </div>
        {history.length > 0 ? (
          <ul className="history-list">
            {history.map((entry, i) => (
              <li key={entry.time + "-" + i}>
                <span className="history-title">{entry.title || "Untitled website"}</span>
                <span className="history-time">{formatHistoryTime(entry.time)}</span>
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => onLoadHistory(entry)}
                >
                  Load
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="history-empty">No websites yet — generate one and it will show up here.</p>
        )}
      </div>
    </section>
  );
}
