/**
 * Offer Balance game engine — public API.
 * Pure, deterministic, framework-free. React is the source of truth; this
 * module only computes.
 */

export * from './config';
export {
  comfortablePct,
  computePriceRisk,
  computeRisk,
  computeBuyerSafety,
} from './risk';
export {
  priceScore,
  timelineScore,
  termScore,
  computeAppeal,
  competitorAppeals,
} from './appeal';
export {
  determineWinner,
  classifyOutcome,
  type WinnerResult,
} from './outcome';
export { computeCounterfactual } from './counterfactual';
export { scoreOffer } from './scoreOffer';
