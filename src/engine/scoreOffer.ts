/**
 * scoreOffer — the single orchestrator the reducer and tests call (ENGINE SPEC §13).
 * Pure composition of the engine primitives; deterministic.
 */

import type { Offer, Scenario, ScoringResult } from '../state/types';
import { competitorAppeals, computeAppeal } from './appeal';
import { computeCounterfactual } from './counterfactual';
import { classifyOutcome, determineWinner } from './outcome';
import { computeBuyerSafety, computeRisk } from './risk';

export function scoreOffer(offer: Offer, scenario: Scenario): ScoringResult {
  const risk = computeRisk(offer, scenario);
  const buyerSafety = computeBuyerSafety(risk);
  const appeal = computeAppeal(offer, scenario);
  const comps = competitorAppeals(scenario);
  const { winnerId, won, margin } = determineWinner(appeal.total, comps, scenario);
  const outcome = classifyOutcome(won, buyerSafety, risk.overextended, margin);
  const counterfactual = computeCounterfactual(offer, scenario);

  return {
    offer,
    scenarioId: scenario.id,
    risk,
    buyerSafety,
    appeal,
    playerAppeal: appeal.total,
    competitorAppeals: comps,
    winnerId,
    won,
    margin,
    outcome,
    counterfactual,
  };
}
