const STEPS = [
  { n: 1, label: "Describe", target: "builder-panel" },
  { n: 2, label: "Generate", target: "builder-panel" },
  { n: 3, label: "Preview & Download", target: "output-panel" },
];

export default function Steps({ currentStep }) {
  const goTo = (target) => {
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ol className="steps" aria-label="How it works">
      {STEPS.map((s) => {
        const state = s.n < currentStep ? "done" : s.n === currentStep ? "active" : "";
        return (
          <li key={s.n}>
            <button
              type="button"
              className={"step-btn " + state}
              onClick={() => goTo(s.target)}
              aria-current={s.n === currentStep ? "step" : undefined}
            >
              <span className="step-num">{s.n < currentStep ? "✓" : s.n}</span>
              <span>{s.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
