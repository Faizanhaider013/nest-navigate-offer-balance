/**
 * Offer Balance — engine constants.
 * Single source of truth for every number in ENGINE SPEC — LOCKED v1.0.
 * No other engine file may hard-code a scoring constant.
 */

import type {
  EarnestTier,
  FinancingOption,
  InspectionOption,
  Offer,
  OfferTerm,
  Timeline,
} from '../state/types';

// --- Default offer (ENGINE SPEC — LOCKED v1.0 §2) ---
export const DEFAULT_OFFER: Offer = {
  pricePct: 3,
  earnest: 'mid',
  inspection: 'full',
  financing: 'keep',
  timeline: 'standard',
};

// --- Price ---
export const PRICE_PCT_MIN = 0;
export const PRICE_PCT_MAX = 10;
export const PRICE_RISK_PER_PCT = 3;
export const PRICE_RISK_MAX = 30;
export const PRICE_SCORE_PER_PCT = 10;

// --- Risk tables (points subtracted from 100) ---
export const EARNEST_RISK: Record<EarnestTier, number> = { low: 2, mid: 10, high: 20 };
export const INSPECTION_RISK: Record<InspectionOption, number> = { full: 0, info: 15, waived: 30 };
export const FINANCING_RISK: Record<FinancingOption, number> = { keep: 0, waived: 25 };
export const TIMELINE_RISK = 0;

export const MAX_TOTAL_RISK = 105; // 30 + 20 + 30 + 25 + 0

// --- Seller-appeal term scores (0..100) ---
export const EARNEST_SCORE: Record<EarnestTier, number> = { low: 30, mid: 65, high: 100 };
export const INSPECTION_SCORE: Record<InspectionOption, number> = { full: 20, info: 60, waived: 100 };
export const FINANCING_SCORE: Record<FinancingOption, number> = { keep: 20, waived: 100 };
export const TIMELINE_MATCH_SCORE = 100;
export const TIMELINE_FALLBACK_SCORE: Record<Timeline, number> = {
  flexible: 70,
  standard: 50,
  needTime: 20,
};

// --- Buyer-safety bands & outcome thresholds ---
export const SAFETY_MAX = 100;
export const SAFETY_GREEN = 70;
export const SAFETY_RED = 40;
export const NARROW_MARGIN = 5;
export const OVEREXTENDED_THRESHOLD = 100; // overextended when risk.total > 100

// --- Winner tie-break: earnest ranking (high beats mid beats low) ---
export const EARNEST_RANK: Record<EarnestTier, number> = { high: 3, mid: 2, low: 1 };

// --- Counterfactual: free lever first, then the rest ---
export const COUNTERFACTUAL_TERM_PREFERENCE: readonly OfferTerm[] = [
  'timeline',
  'price',
  'earnest',
  'financing',
  'inspection',
];

/** Deterministic clamp used by every risk/safety calculation. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
