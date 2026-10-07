interface SubmitBarProps {
  onSubmit: () => void;
}

export function SubmitBar({ onSubmit }: SubmitBarProps) {
  return (
    <div className="ob-submit-area">
      <p>Ready to see how your offer lands?</p>
      <button
        type="button"
        className="ob-btn ob-btn-primary"
        onClick={onSubmit}
      >
        Submit this offer <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
