import { Shell } from "../components/layout/Shell";
import { HomeScene } from "../components/visual/HomeScene";
import { useGame } from "../app/GameProvider";
import { TOTAL_ROUNDS } from "../state/reducer";

export function IntroScreen() {
  const { dispatch } = useGame();
  return (
    <Shell size="wide">
      <article className="intro-hero">
        <div className="intro-copy">
          <p className="game-pill">
            <span aria-hidden="true">✦</span> The homebuying mini-game
          </p>
          <h1>
            Offer <span>Balance</span>
            <span className="title-dot" aria-hidden="true">
              .
            </span>
          </h1>
          <p className="intro-tagline">
            Build an offer that works
            <br className="desktop-break" /> for both sides.
          </p>
          <p className="ob-lede">
            A higher price is only part of the story. Find the sweet spot
            between what the seller wants and what feels right for you.
          </p>
          <div className="game-facts">
            <span>{TOTAL_ROUNDS} homes</span>
            <span>About 3 minutes</span>
            <span>No experience needed</span>
          </div>
          <button
            type="button"
            className="ob-btn ob-btn-primary"
            onClick={() => dispatch({ type: "START_GAME" })}
          >
            Start playing <span aria-hidden="true">→</span>
          </button>
          <p className="intro-reassurance">
            Real choices. A safe place to try them.
          </p>
        </div>
        <HomeScene />
      </article>
      <section className="intro-how" aria-label="How it works">
        <div>
          <span className="lesson-number">01</span>
          <h2>Make it yours</h2>
          <p>Choose your price, protections, and timing.</p>
        </div>
        <div>
          <span className="lesson-number">02</span>
          <h2>Find your balance</h2>
          <p>See how each choice feels for you and the seller.</p>
        </div>
        <div>
          <span className="lesson-number">03</span>
          <h2>Take something away</h2>
          <p>Discover why an offer wins, and when winning costs too much.</p>
        </div>
      </section>
      <p className="learning-note">
        <span aria-hidden="true">♡</span> The goal is a thoughtful offer. Not a
        home at any cost.
      </p>
    </Shell>
  );
}
