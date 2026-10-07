import { Shell } from "../components/layout/Shell";
import { HomeScene } from "../components/visual/HomeScene";
import { useGame } from "../app/GameProvider";
import { SCENARIOS } from "../data/scenarios";
import { formatCurrency } from "./building/presentation";
import { TOTAL_ROUNDS } from "../state/reducer";

export function RevealScreen() {
  const { state, dispatch } = useGame();
  const result = state.currentResult;
  const scenario = SCENARIOS[state.roundIndex];
  return (
    <Shell>
      <section className="reveal-screen">
        <p className="ob-eyebrow">
          Home {state.roundIndex + 1} of {TOTAL_ROUNDS} · Offer delivered
        </p>
        <h1 className="ob-title">Seeing how it lands</h1>
        <p className="ob-lede">
          One home. Different offers. More than just a price.
        </p>
        <div className="reveal-scene">
          <HomeScene compact />
          <div className="offer-envelope">
            <span aria-hidden="true">✉</span>
            <div>
              <small>Your offer</small>
              <strong>
                {result
                  ? formatCurrency(
                      scenario.listPrice * (1 + result.offer.pricePct / 100),
                    )
                  : "Ready for review"}
              </strong>
            </div>
          </div>
        </div>
        <ol className="reveal-steps" aria-label="Offer review">
          <li>
            <span aria-hidden="true">✓</span> Offer sent
          </li>
          <li>
            <span aria-hidden="true">✓</span> Terms compared
          </li>
          <li>
            <span aria-hidden="true">→</span> Your result
          </li>
        </ol>
        <p className="review-caption">
          The seller has compared your terms with {scenario.competitors.length}{" "}
          other offers. See what mattered, and how your comfort held up.
        </p>
        <button
          type="button"
          className="ob-btn ob-btn-primary"
          onClick={() => dispatch({ type: "REVEAL_COMPLETE" })}
        >
          See the result <span aria-hidden="true">→</span>
        </button>
      </section>
    </Shell>
  );
}
