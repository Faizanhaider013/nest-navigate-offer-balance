# Offer Balance

A short, browser-based **Learn & Play** mini-game for first-time homebuyers, built for the Nest Navigate Full Stack Engineering take-home.

---

## Game Concept

Offer Balance is a short strategy game that teaches first-time homebuyers that making a strong home offer is about more than simply offering the highest price.

The player takes the role of a buyer competing for a home and builds an offer by balancing five real-world factors: price, earnest money, inspection protection, financing protection, and closing timeline. Each choice affects two things: how attractive the offer is to the seller and how much financial or contractual risk the buyer takes on. After submitting an offer, the player sees how it compares with competing offers and learns whether their strategy won, lost, or exposed them to unnecessary risk.

The core mechanic is an offer-building tradeoff system rather than a quiz. Increasing price or removing protections can make an offer more competitive, but may reduce the buyer's safety. In different scenarios, sellers prioritize different things, so the best strategy changes from round to round.

By the end of the game, players should understand that a competitive offer is a balance between seller appeal and personal protection. They also learn that losing a deal can sometimes be a healthy outcome when winning would require taking on too much risk.

The game is engaging because every decision has a visible consequence, each scenario presents a different strategic challenge, and players can experiment with different offers to discover how small changes affect the outcome.

---

## How to Run Locally

**Prerequisites**
- Node.js 18+ (developed and verified on Node 22) and npm.

**Install**
```bash
npm install
```

**Run the dev server**
```bash
npm run dev
```
Then open the URL Vite prints in the terminal — by default **http://localhost:5173/**.

**Production build**
```bash
npm run build
```
This runs `tsc --noEmit` and then `vite build`, outputting to `dist/`. Preview the built app with:
```bash
npm run preview
```

**Tests and type-checking**
```bash
npm test          # run the full test suite once (Vitest)
npm run typecheck # strict TypeScript check (tsc --noEmit)
```
A watch mode is also available via `npm run test:watch`.

---

## Tech Choices

- **React 18** — a small, phase-driven UI (intro, building, reveal, debrief, summary) renders cleanly from a single piece of game state. React's component model keeps each screen and control focused and testable.
- **TypeScript (strict)** — the whole project is typed in strict mode, which matters most for the scoring engine: offer terms, outcomes, and results are modeled as precise types, so invalid states are caught at compile time.
- **Vite 5** — fast dev server and build tooling, and it doubles as the Vitest runner, so app and tests share one configuration.
- **Styling: plain CSS** — hand-written CSS using custom properties (design tokens), with a shared `global.css` and screen-scoped styles (e.g. `building.css`). It includes responsive layouts and `prefers-reduced-motion` / `forced-colors` handling. No CSS framework or UI kit is used, keeping the bundle small and the visual language intentional.
- **State management: React `useReducer` + Context** — a single reducer (`src/state/reducer.ts`) acts as a small state machine for the game phases, exposed through a lightweight `GameProvider`/`useGame` hook. No external state library is used.
- **Testing: Vitest + React Testing Library + jsdom** — pure unit tests for the engine and reducer, plus component/flow tests for the UI.

**Architecture (reviewer-level):** game logic lives in a pure, framework-free **engine** (`src/engine`) that is the single source of truth for all scoring; it has no React or DOM dependencies. The **reducer** (`src/state`) orchestrates the engine and holds only the minimal game state. **Scenario data** (`src/data`) is static. **React** (`src/components`, `src/screens`, `src/app`) is a presentation layer that reads from the engine and dispatches actions — it never re-implements scoring.

---

## How the Game Works

Player flow:

```
Intro → Build an offer → Review Buyer Safety and Seller Appeal → Submit offer
     → Reveal → Debrief (learn from the result) → next home (×3) → Final summary → Replay
```

The player builds an offer for each of three homes by setting five decisions:

- **Price** — how much over the list price to offer.
- **Earnest money** — the good-faith deposit (smaller, standard, or larger).
- **Inspection** — keep a full inspection, make it informational only, or waive it.
- **Financing** — keep or waive the loan safety net (the protection if the mortgage falls through).
- **Timeline** — flexible, standard, or "I need extra time" for closing.

As the player adjusts these, two live meters update immediately: **Buyer Safety** (how comfortable the offer is for *you*) and **Seller Appeal** (how attractive it is to the *seller*). The core educational tradeoff is visible the whole time: moves that make an offer more appealing to the seller — a higher price, a bigger deposit, fewer protections — often lower the buyer's safety. There is no single "right answer," only a balance to find.

After submitting, the reveal and debrief show how the offer compared with the other buyers, what the seller valued, and whether the result was a strong win, a narrow win, an accepted-but-risky deal, a healthy walk-away, or an overextension.

---

## Game Design & Learning

- **The mechanic is native to the concept.** A real home offer *is* a bundle of tradeoffs, not a single number. Building the offer term-by-term and watching the consequences is the same decision a real buyer faces — so the game teaches by doing, not by quizzing.
- **Buyer Safety** represents the buyer's own comfort and exposure: how much money is at stake and how many protections they've given up. Higher is safer.
- **Seller Appeal** represents how attractive the offer is to this particular seller, given what they care about.
- **Different scenarios require different strategies** because each seller weighs the five factors differently — one may chase the top price, another may want certainty, another a fast close. A strategy that wins one home can lose the next, which pushes the player to read each situation instead of memorizing one tactic.
- **A "loss" can be healthy.** Sometimes the only way to win a home would mean overpaying or stripping away protections. Walking away with your safety intact is framed as a sound decision — reinforcing that winning at any cost is not the goal.

---

## Testing & Quality

Verified results for the current repository:

- **125 / 125 tests passing** (`npm test`, Vitest).
- **TypeScript:** `npm run typecheck` (`tsc --noEmit`) passes.
- **Production build:** `npm run build` (`tsc --noEmit` + `vite build`) passes.

Coverage highlights:
- The engine is tested in isolation across **outcome classification, risk, appeal, counterfactual, and scoring**.
- A dedicated **regression** suite covers two audit findings — correct tie handling (a tie is never reported as a player win) and accurate counterfactual wording (an accepted-but-risky result is not described as "overextended") — including an exhaustive sweep over every reachable offer in all three scenarios.
- The reducer (state machine) and the React screens/flows are covered by their own tests.

Testing stack: **Vitest** with **React Testing Library** and **jsdom**.

---

## What I'd Do With More Time

- Add more homebuying scenarios and more nuanced seller motivations.
- Richer visual feedback on the reveal (e.g. an animated side-by-side offer comparison).
- Additional or more granular offer strategies and terms.
- Deeper, optional "learn more" explanations for each concept in the debrief.
- Usability testing with actual first-time buyers to validate the language and difficulty curve.
- Lightweight analytics — only if this were a real production product — to see where players hesitate or misjudge the tradeoff.

(None of the above is implemented today; the current build is intentionally a focused prototype.)

---

## Known Issues

No known blocking issues. The current prototype is intentionally scoped as a frontend-only learning game, so persistence, accounts, backend services, and production analytics are outside the assignment scope. The reveal step is a clean React transition rather than an animated sequence, which is a deliberate scoping choice for this prototype.

---

## Project Scope

This is intentionally a focused frontend prototype for the assignment:

- Browser-only state (React `useReducer` + Context).
- No backend.
- No authentication.
- No database.
- No external API dependencies.

---

## Submission

- **GitHub Repository:** [REPOSITORY_URL]
- **Live Demo:** [DEPLOYED_APP_URL]
