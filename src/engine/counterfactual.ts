/**
 * Counterfactual (ENGINE SPEC §12).
 * Single-lever "what if", deterministic and bounded.
 *
 * Self-contained: it re-evaluates the submitted offer and every single-term
 * variant using the engine primitives, so it can be tested in isolation given
 * only (offer, scenario). (See "Assumptions" in the delivery notes.)
 */

import type {
  Counterfactual,
  EarnestTier,
  FinancingOption,
  InspectionOption,
  Offer,
  OfferTerm,
  OutcomeKind,
  Scenario,
  Timeline,
} from '../state/types';
import {
  COUNTERFACTUAL_TERM_PREFERENCE,
  PRICE_PCT_MAX,
  PRICE_PCT_MIN,
} from './config';
import { competitorAppeals, computeAppeal } from './appeal';
import { classifyOutcome, determineWinner } from './outcome';
import { computeBuyerSafety, computeRisk } from './risk';

interface CandidateEval {
  term: OfferTerm;
  offer: Offer;
  riskTotal: number;
  overextended: boolean;
  buyerSafety: number;
  playerAppeal: number;
  won: boolean;
  margin: number;
  outcome: OutcomeKind;
}

const EARNEST_TIERS: readonly EarnestTier[] = ['low', 'mid', 'high'];
const INSPECTION_OPTIONS: readonly InspectionOption[] = ['full', 'info', 'waived'];
const FINANCING_OPTIONS: readonly FinancingOption[] = ['keep', 'waived'];
const TIMELINE_OPTIONS: readonly Timeline[] = ['flexible', 'standard', 'needTime'];

const EARNEST_LABEL: Record<EarnestTier, string> = {
  low: '1% earnest money',
  mid: '3% earnest money',
  high: '5% earnest money',
};
const INSPECTION_LABEL: Record<InspectionOption, string> = {
  full: 'full inspection',
  info: 'informational inspection',
  waived: 'waived inspection',
};
const FINANCING_LABEL: Record<FinancingOption, string> = {
  keep: 'keep the financing contingency',
  waived: 'waive the financing contingency',
};
const TIMELINE_LABEL: Record<Timeline, string> = {
  flexible: "match the seller's close date",
  standard: 'a standard close',
  needTime: 'extra time to close',
};

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function labelFor(term: OfferTerm, offer: Offer): string {
  switch (term) {
    case 'price':
      return `list +${offer.pricePct}%`;
    case 'earnest':
      return EARNEST_LABEL[offer.earnest];
    case 'inspection':
      return INSPECTION_LABEL[offer.inspection];
    case 'financing':
      return FINANCING_LABEL[offer.financing];
    case 'timeline':
      return TIMELINE_LABEL[offer.timeline];
  }
}

function prefIndex(term: OfferTerm): number {
  return COUNTERFACTUAL_TERM_PREFERENCE.indexOf(term);
}

/** Every offer that differs from `offer` in exactly one term. */
function buildCandidates(offer: Offer): Array<{ term: OfferTerm; offer: Offer }> {
  const out: Array<{ term: OfferTerm; offer: Offer }> = [];
  for (let p = PRICE_PCT_MIN; p <= PRICE_PCT_MAX; p++) {
    if (p !== offer.pricePct) out.push({ term: 'price', offer: { ...offer, pricePct: p } });
  }
  for (const e of EARNEST_TIERS) {
    if (e !== offer.earnest) out.push({ term: 'earnest', offer: { ...offer, earnest: e } });
  }
  for (const i of INSPECTION_OPTIONS) {
    if (i !== offer.inspection) out.push({ term: 'inspection', offer: { ...offer, inspection: i } });
  }
  for (const f of FINANCING_OPTIONS) {
    if (f !== offer.financing) out.push({ term: 'financing', offer: { ...offer, financing: f } });
  }
  for (const t of TIMELINE_OPTIONS) {
    if (t !== offer.timeline) out.push({ term: 'timeline', offer: { ...offer, timeline: t } });
  }
  return out;
}

function evalCandidate(
  term: OfferTerm,
  offer: Offer,
  scenario: Scenario,
  comps: ReturnType<typeof competitorAppeals>,
): CandidateEval {
  const risk = computeRisk(offer, scenario);
  const buyerSafety = computeBuyerSafety(risk);
  const appeal = computeAppeal(offer, scenario);
  const { won, margin } = determineWinner(appeal.total, comps, scenario);
  const outcome = classifyOutcome(won, buyerSafety, risk.overextended, margin);
  return {
    term,
    offer,
    riskTotal: risk.total,
    overextended: risk.overextended,
    buyerSafety,
    playerAppeal: appeal.total,
    won,
    margin,
    outcome,
  };
}

function buildResult(
  candidate: CandidateEval,
  submitted: CandidateEval,
  flipsToWin: boolean,
  message: string,
): Counterfactual {
  return {
    term: candidate.term,
    fromLabel: labelFor(candidate.term, submitted.offer),
    toLabel: labelFor(candidate.term, candidate.offer),
    appealDelta: round2(candidate.playerAppeal - submitted.playerAppeal),
    riskDelta: round2(candidate.riskTotal - submitted.riskTotal),
    flipsToWin,
    message,
  };
}

function signed(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function computeCounterfactual(offer: Offer, scenario: Scenario): Counterfactual | null {
  const comps = competitorAppeals(scenario);
  const submitted = evalCandidate('price', offer, scenario, comps); // term unused for submitted
  const evals = buildCandidates(offer).map((c) => evalCandidate(c.term, c.offer, scenario, comps));

  // --- LOST: find the cheapest single change that wins ---
  if (!submitted.won) {
    const winning = evals.filter((e) => e.won && !e.overextended);
    if (winning.length > 0) {
      winning.sort(
        (a, b) =>
          a.riskTotal - b.riskTotal ||
          prefIndex(a.term) - prefIndex(b.term) ||
          a.offer.pricePct - b.offer.pricePct,
      );
      const best = winning[0];
      const appealDelta = round2(best.playerAppeal - submitted.playerAppeal);
      const riskDelta = round2(best.riskTotal - submitted.riskTotal);
      const message =
        `You lost by ${round2(Math.abs(submitted.margin))} appeal. Switching to ` +
        `${labelFor(best.term, best.offer)} adds ${appealDelta} appeal for ` +
        `${signed(riskDelta)} risk — enough to win.`;
      return buildResult(best, submitted, true, message);
    }

    // No single change wins — surface the highest-leverage safe nudge.
    const nudge = evals.filter((e) => !e.overextended);
    if (nudge.length === 0) return null;
    nudge.sort(
      (a, b) =>
        b.playerAppeal - a.playerAppeal ||
        prefIndex(a.term) - prefIndex(b.term) ||
        a.offer.pricePct - b.offer.pricePct,
    );
    const best = nudge[0];
    const appealDelta = round2(best.playerAppeal - submitted.playerAppeal);
    const message =
      `No single change wins this one. Your strongest single move is ` +
      `${labelFor(best.term, best.offer)} (+${appealDelta} appeal); ` +
      `you'd need to combine changes to beat the top offer.`;
    return buildResult(best, submitted, false, message);
  }

  // --- WON but stretched: show how to keep the win with more safety ---
  if (submitted.outcome === 'acceptedRisky' || submitted.outcome === 'overextended') {
    const safer = evals.filter(
      (e) => e.won && !e.overextended && e.buyerSafety > submitted.buyerSafety,
    );
    if (safer.length === 0) return null;
    safer.sort(
      (a, b) =>
        b.buyerSafety - a.buyerSafety ||
        prefIndex(a.term) - prefIndex(b.term) ||
        a.offer.pricePct - b.offer.pricePct,
    );
    const best = safer[0];
    const safetyGain = round2(best.buyerSafety - submitted.buyerSafety);
    // Describe the submitted offer by its ACTUAL state: overextended only when
    // risk.overextended is true; an acceptedRisky offer is risky, not overextended.
    const framing = submitted.overextended
      ? 'You got the house, but this offer is overextended — past your comfort limit.'
      : 'You got the house, but this offer is risky for you.';
    const message =
      `${framing} Switching to ${labelFor(best.term, best.offer)} ` +
      `keeps the win and restores ${safetyGain} points of Buyer Safety.`;
    return buildResult(best, submitted, true, message);
  }

  // strongWin or narrowWin — nothing instructive to change.
  return null;
}
