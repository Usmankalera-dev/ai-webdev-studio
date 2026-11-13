import { MODEL_CARDS } from "../lib/coarena";

/* Clickable model cards — the platform's AI lineup, served free by Coarena.
   Clicking a card selects that model (saved in localStorage by the parent). */

function SpeedDots({ level }) {
  return (
    <span className="model-speed" aria-label={`Speed ${level} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= level ? "dot on" : "dot"} aria-hidden="true" />
      ))}
      <span className="speed-label">Speed</span>
    </span>
  );
}

export default function ModelCards({ model, onModelChange }) {
  return (
    <div className="model-grid" role="radiogroup" aria-label="Choose your AI model">
      {MODEL_CARDS.map((m) => {
        const selected = model === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={"model-card" + (selected ? " selected" : "")}
            onClick={() => onModelChange(m.id)}
          >
            <span className="model-top">
              <span className="model-name">{m.name}</span>
              {m.badge && <span className="model-badge">{m.badge}</span>}
            </span>
            <span className="model-best">{m.bestFor}</span>
            <SpeedDots level={m.speed} />
            <span className="model-id">{m.id}</span>
            <span className="model-free">via Coarena • Free</span>
          </button>
        );
      })}
    </div>
  );
}
