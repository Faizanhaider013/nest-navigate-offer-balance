import type { OutcomeKind } from "../../state/types";
import { OUTCOME_PRESENTATION } from "../../screens/results/presentation";
export function OutcomeBanner({
  outcome,
  won,
}: {
  outcome: OutcomeKind;
  won: boolean;
}) {
  const copy = OUTCOME_PRESENTATION[outcome];
  return (
    <section
      className="outcome-banner"
      data-tone={copy.tone}
      aria-label="Offer outcome"
    >
      <span className="outcome-symbol" aria-hidden="true">
        {copy.symbol}
      </span>
      <div>
        <p className="ob-eyebrow">
          {won ? "Offer accepted" : "Another offer was chosen"}
        </p>
        <h2>{copy.title}</h2>
        <p>{copy.message}</p>
      </div>
    </section>
  );
}
