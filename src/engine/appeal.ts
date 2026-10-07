/**
 * Seller Appeal (ENGINE SPEC §4, §6).
 * appeal.total = Σ sellerWeights[term] * termScore[term]   // range 0..100
 */

import type {
  AppealBreakdown,
  AppealContribution,
  CompetitorAppeal,
  Offer,
  OfferTerm,
  Scenario,
  Timeline,
} from '../state/types';
import {
  EARNEST_SCORE,
  FINANCING_SCORE,
  INSPECTION_SCORE,
  PRICE_SCORE_PER_PCT,
  TIMELINE_FALLBACK_SCORE,
  TIMELINE_MATCH_SCORE,
} from './config';

const APPEAL_TERMS: readonly OfferTerm[] = [
  'price',
  'earnest',
  'inspection',
  'financing',
  'timeline',
];

export function priceScore(pricePct: number): number {
  return PRICE_SCORE_PER_PCT * pricePct;
}

export function timelineScore(timeline: Timeline, target: Timeline): number {
  return timeline === target ? TIMELINE_MATCH_SCORE : TIMELINE_FALLBACK_SCORE[timeline];
}

export function termScore(term: OfferTerm, offer: Offer, scenario: Scenario): number {
  switch (term) {
    case 'price':
      return priceScore(offer.pricePct);
    case 'earnest':
      return EARNEST_SCORE[offer.earnest];
    case 'inspection':
      return INSPECTION_SCORE[offer.inspection];
    case 'financing':
      return FINANCING_SCORE[offer.financing];
    case 'timeline':
      return timelineScore(offer.timeline, scenario.sellerTargetTimeline);
  }
}

export function computeAppeal(offer: Offer, scenario: Scenario): AppealBreakdown {
  const contributions = {} as Record<OfferTerm, AppealContribution>;
  let total = 0;
  for (const term of APPEAL_TERMS) {
    const score = termScore(term, offer, scenario);
    const weight = scenario.sellerWeights[term];
    const contribution = weight * score;
    contributions[term] = { term, termScore: score, weight, contribution };
    total += contribution;
  }
  return { contributions, total };
}

export function competitorAppeals(scenario: Scenario): CompetitorAppeal[] {
  return scenario.competitors.map((competitor) => ({
    id: competitor.id,
    appeal: computeAppeal(competitor.offer, scenario).total,
  }));
}
