import { Shell } from "../components/layout/Shell";
import { useGame } from "../app/GameProvider";
import { TOTAL_ROUNDS } from "../state/reducer";
import { SCENARIOS } from "../data/scenarios";
import { OutcomeBanner } from "../components/feedback/OutcomeBanner";
import { BuyerSafetyMeter } from "../components/feedback/BuyerSafetyMeter";
import { AppealEstimate } from "../components/feedback/AppealEstimate";
import { TERM_LABELS, friendlyTip } from "./results/presentation";
import type { OfferTerm } from "../state/types";

export function DebriefScreen() {
  const { state, dispatch } = useGame();
  const isFinalRound = state.roundIndex >= TOTAL_ROUNDS - 1;
  const result = state.currentResult;
  const scenario = SCENARIOS[state.roundIndex];
  const priorities = (
    Object.entries(scenario.sellerWeights) as [OfferTerm, number][]
  ).sort((a, b) => b[1] - a[1]);
  const winner = scenario.competitors.find((c) => c.id === result?.winnerId);
  const strongestContribution =
    result &&
    Object.values(result.appeal.contributions).sort(
      (a, b) => b.contribution - a.contribution,
    )[0];
  const biggestExposure =
    result &&
    (
      Object.entries(result.risk).filter(([key]) => key in TERM_LABELS) as [
        OfferTerm,
        number,
      ][]
    ).sort((a, b) => b[1] - a[1])[0];
  return (
    <Shell size="wide">
      <div className="result-header">
        <div>
          <p className="ob-eyebrow">
            Home {state.roundIndex + 1} of {TOTAL_ROUNDS} · A moment to learn
          </p>
          <h1 className="ob-title">Your result</h1>
        </div>
        <p>{scenario.homeLabel}</p>
      </div>
      {result ? (
        <>
          <OutcomeBanner outcome={result.outcome} won={result.won} />
          <div className="debrief-grid">
            <div className="debrief-main">
              <section className="lesson-panel">
                <p className="section-kicker">01 · What happened</p>
                <h2>
                  {result.won
                    ? "Your offer connected with this seller."
                    : `${winner?.name ?? "Another buyer"} had the chosen offer.`}
                </h2>
                <p>{scenario.sellerNote}</p>
                <div
                  className="offer-comparison"
                  aria-label="Seller appeal comparison"
                >
                  {[
                    {
                      id: "player",
                      name: "Your offer",
                      appeal: result.playerAppeal,
                    },
                    ...result.competitorAppeals.map((c) => ({
                      ...c,
                      name:
                        scenario.competitors.find((b) => b.id === c.id)?.name ??
                        c.id,
                    })),
                  ].map((offer) => (
                    <div
                      key={offer.id}
                      className={
                        offer.id === "player"
                          ? "comparison-row is-yours"
                          : "comparison-row"
                      }
                    >
                      <span>
                        {offer.name}
                        {offer.id === result.winnerId && <small>Chosen</small>}
                      </span>
                      <div className="comparison-bar" aria-hidden="true">
                        <span style={{ width: `${offer.appeal}%` }} />
                      </div>
                      <strong
                        aria-label={`${offer.appeal.toFixed(1)} seller appeal`}
                      >
                        {Number(offer.appeal.toFixed(1))}
                      </strong>
                    </div>
                  ))}
                </div>
                <p className="panel-footnote">
                  Seller appeal out of 100. The chosen offer comes from the
                  game’s full comparison, including any tie-break.
                </p>
              </section>
              <section className="lesson-panel">
                <p className="section-kicker">02 · Why it mattered</p>
                <h2>What this seller cared about</h2>
                <p>Longer bars mean a stronger priority for this home.</p>
                <ol className="priority-list">
                  {priorities.map(([term, weight], index) => (
                    <li key={term}>
                      <span>
                        {TERM_LABELS[term]}
                        {index === 0 && <small>Top priority</small>}
                      </span>
                      <span className="priority-track" aria-hidden="true">
                        <span
                          style={{
                            width: `${(weight / priorities[0][1]) * 100}%`,
                          }}
                        />
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="tradeoff-pair">
                  <p>
                    <strong>For the seller</strong>
                    {strongestContribution && (
                      <>
                        {TERM_LABELS[strongestContribution.term]} contributed
                        most to your offer’s appeal.
                      </>
                    )}
                  </p>
                  <p>
                    <strong>For you</strong>
                    {biggestExposure && biggestExposure[1] > 0
                      ? `${TERM_LABELS[biggestExposure[0]]} was the biggest source of exposure in your offer.`
                      : "Your choices kept exposure low."}
                  </p>
                </div>
              </section>
              <section className="learning-tip">
                <span className="tip-symbol" aria-hidden="true">
                  ✦
                </span>
                <div>
                  <p className="section-kicker">03 · Take it with you</p>
                  <h2>
                    {result.counterfactual
                      ? "One change to explore"
                      : "Keep both sides in view"}
                  </h2>
                  <p>
                    {result.counterfactual
                      ? friendlyTip(result.counterfactual.message)
                      : "Different sellers value different things. Keep checking your own comfort as you make an offer more appealing."}
                  </p>
                  {result.counterfactual && (
                    <small>
                      A comparison to learn from, not a reason to give up
                      protections automatically.
                    </small>
                  )}
                </div>
              </section>
            </div>
            <aside className="result-sidebar" aria-label="Your submitted offer">
              <div className="ob-feedback-heading">
                <p className="ob-eyebrow">Your submitted offer</p>
                <h2>Both sides of the decision</h2>
              </div>
              <BuyerSafetyMeter
                safety={result.buyerSafety}
                overextended={result.risk.overextended}
              />
              <AppealEstimate appeal={result.playerAppeal} />
              <p className="ob-balance-note">
                Seller acceptance and buyer comfort are two different kinds of
                success.
              </p>
            </aside>
          </div>
        </>
      ) : (
        <p className="ob-lede">Your submitted offer will appear here.</p>
      )}
      <div className="next-home">
        <p>
          {isFinalRound
            ? "Three homes. A clearer perspective."
            : "A different home. A different seller."}
        </p>
        <button
          type="button"
          className="ob-btn ob-btn-primary"
          onClick={() => dispatch({ type: "NEXT_ROUND" })}
        >
          {isFinalRound ? "See how you did" : "Next home"}{" "}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </Shell>
  );
}
