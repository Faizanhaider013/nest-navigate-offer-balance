/**
 * Risk & Buyer Safety (ENGINE SPEC §3, §5).
 * priceRisk = clamp(3 * (pricePct - comfortablePct), 0, 30),
 *   comfortablePct = (comfortablePrice / listPrice - 1) * 100
 * buyerSafety = clamp(100 - risk.total, 0, 100)
 */

import type { Offer, RiskBreakdown, Scenario } from '../state/types';
import {
  clamp,
  EARNEST_RISK,
  FINANCING_RISK,
  INSPECTION_RISK,
  OVEREXTENDED_THRESHOLD,
  PRICE_RISK_MAX,
  PRICE_RISK_PER_PCT,
  SAFETY_MAX,
  TIMELINE_RISK,
} from './config';

export function comfortablePct(scenario: Scenario): number {
  return (scenario.comfortablePrice / scenario.listPrice - 1) * 100;
}

export function computePriceRisk(pricePct: number, scenario: Scenario): number {
  const raw = PRICE_RISK_PER_PCT * (pricePct - comfortablePct(scenario));
  return clamp(raw, 0, PRICE_RISK_MAX);
}

export function computeRisk(offer: Offer, scenario: Scenario): RiskBreakdown {
  const price = computePriceRisk(offer.pricePct, scenario);
  const earnest = EARNEST_RISK[offer.earnest];
  const inspection = INSPECTION_RISK[offer.inspection];
  const financing = FINANCING_RISK[offer.financing];
  const timeline = TIMELINE_RISK;
  const total = price + earnest + inspection + financing + timeline;
  return {
    price,
    earnest,
    inspection,
    financing,
    timeline,
    total,
    overextended: total > OVEREXTENDED_THRESHOLD,
  };
}

export function computeBuyerSafety(risk: RiskBreakdown): number {
  return clamp(SAFETY_MAX - risk.total, 0, SAFETY_MAX);
}
