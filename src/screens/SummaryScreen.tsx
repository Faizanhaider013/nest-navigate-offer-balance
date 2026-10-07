import { Shell } from "../components/layout/Shell";
import { HomeScene } from "../components/visual/HomeScene";
import { useGame } from "../app/GameProvider";
import { SCENARIO_BY_ID } from "../data/scenarios";
import { OUTCOME_PRESENTATION } from "./results/presentation";

export function SummaryScreen() {
  const { state, dispatch } = useGame();
  return (
    <Shell size="wide">
      <section className="summary-hero">
        <div>
          <p className="game-pill">Your Offer Balance</p>
          <h1 className="ob-title">How you did</h1>
          <p className="intro-tagline">
            A little practice.
            <br />A clearer path home.
          </p>
          <p className="ob-lede">
            {state.roundResults.length} homes explored. Different priorities.
            One lesson: the best offer should work for you, too.
          </p>
        </div>
        <HomeScene compact />
      </section>
      <section className="round-recap" aria-label="Your home journey">
        {state.roundResults.map((round) => (
          <article
            className="recap-card"
            data-tone={OUTCOME_PRESENTATION[round.outcome].tone}
            key={round.scenarioId}
          >
            <div className="recap-top">
              <span className="lesson-number">0{round.roundIndex + 1}</span>
              <span>{round.won ? "Accepted" : "Not accepted"}</span>
            </div>
            <p className="recap-home">
              {SCENARIO_BY_ID[round.scenarioId].homeLabel}
            </p>
            <h2>{OUTCOME_PRESENTATION[round.outcome].title}</h2>
            <dl>
              <div>
                <dt>Buyer comfort</dt>
                <dd>
                  {round.buyerSafety}
                  <small> / 100</small>
                </dd>
              </div>
              <div>
                <dt>Seller appeal</dt>
                <dd>
                  {Math.round(round.sellerAppeal)}
                  <small> / 100</small>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
      <section className="summary-lessons">
        <p className="section-kicker">What you’re taking with you</p>
        <h2>There’s more than one side to a good offer.</h2>
        <ul>
          <li>
            <span aria-hidden="true">01</span>
            <div>
              <strong>Listen to the seller.</strong>
              <p>
                Price, protections, and timing matter differently from home to
                home.
              </p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <div>
              <strong>Keep your comfort in the picture.</strong>
              <p>A more appealing offer can also ask more of you.</p>
            </div>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <div>
              <strong>Winning isn’t the only good outcome.</strong>
              <p>
                Keeping your protections can be a decision worth standing by.
              </p>
            </div>
          </li>
        </ul>
      </section>
      <div className="next-home">
        <p>Curious what a different balance looks like?</p>
        <button
          type="button"
          className="ob-btn ob-btn-primary"
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          Play again <span aria-hidden="true">↗</span>
        </button>
      </div>
    </Shell>
  );
}
