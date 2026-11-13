export default function Settings({
  apiKey,
  onApiKeyChange,
  showKey,
  onToggleShowKey,
  onSaveKey,
  onTestKey,
  onClearKey,
  keyStatus,
  usage,
  settingsOpen,
  onToggleSettings,
  busy,
}) {
  const pct =
    usage && usage.limit > 0
      ? Math.max(0, Math.min(100, (usage.used / usage.limit) * 100))
      : 0;

  return (
    <div className="settings">
      <button
        type="button"
        className="settings-summary"
        onClick={() => onToggleSettings(!settingsOpen)}
        aria-expanded={settingsOpen}
      >
        <span>⚙️ Settings — Fable API Key</span>
        <span aria-hidden="true">{settingsOpen ? "▾" : "▸"}</span>
      </button>

      {(
        <div className={"settings-body" + (settingsOpen ? "" : " hidden")}>
          <p className="settings-note">
            Your key is stored <strong>only in this browser</strong> (localStorage) and is used
            automatically on every visit. It is never sent anywhere except to Coarena&rsquo;s API.
            Coarena is <strong>FREE</strong> — $5 of model use a day, Coarena pays, no card needed,
            30 requests/minute. Keys expire after 90 days. Get a key at{" "}
            <a href="https://coarena.ai/account/api/keys" target="_blank" rel="noopener">
              coarena.ai → API Keys
            </a>
            .
          </p>
          <p className="hint-ur">
            Key sirf is browser me save hoti hai — kahin aur nahi jati. Aik dafa daal dein, phir
            har dafa khud ba khud use hogi.
          </p>

          <label className="field-label" htmlFor="apiKey">
            Fable (Coarena) API key
          </label>
          <div className="key-row">
            <input
              type={showKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Paste your Fable (Coarena) API key here"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="btn ghost small"
              title="Show / hide key"
              onClick={onToggleShowKey}
            >
              👁
            </button>
          </div>
          <div className="key-actions">
            <button type="button" className="btn small" onClick={onSaveKey} disabled={busy}>
              Save Key
            </button>
            <button type="button" className="btn ghost small" onClick={onTestKey} disabled={busy}>
              Test Key
            </button>
            <button type="button" className="btn ghost small" onClick={onClearKey} disabled={busy}>
              Remove
            </button>
          </div>

          {usage && (
            <div className="usage-meter" aria-label="Today's free usage">
              <p>
                Today&rsquo;s free use:{" "}
                <strong>
                  ${usage.used.toFixed(2)} of ${usage.limit.toFixed(2)}
                </strong>
              </p>
              <div className="usage-track">
                <div className="usage-fill" style={{ width: pct + "%" }} />
              </div>
            </div>
          )}

          <p className={"key-status " + (keyStatus.ok ? "ok" : "bad")}>{keyStatus.msg}</p>
        </div>
      )}
    </div>
  );
}
