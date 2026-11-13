export default function StickyBar({ currentStep, busy, onGenerate }) {
  return (
    <div className="sticky-bar">
      <span className="step-label">Step {currentStep} of 3</span>
      <button
        type="button"
        className="btn primary"
        onClick={onGenerate}
        disabled={busy}
      >
        {busy ? "Generating…" : "✦ Generate Website"}
      </button>
    </div>
  );
}
