/**
 * PRESENTATION ONLY. Friendly labels and helpers for the Building screen.
 * These never affect scoring — the engine enums are the source of truth, and
 * the Buyer Safety band thresholds are imported from the engine, not redefined.
 */

import { SAFETY_GREEN, SAFETY_RED } from '../../engine';
import type { EarnestTier, FinancingOption, InspectionOption, Timeline } from '../../state/types';

export interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  hint: string;
}

export const EARNEST_OPTIONS: ReadonlyArray<ChoiceOption<EarnestTier>> = [
  { value: 'low', label: 'Smaller · 1%', hint: 'Keeps more cash in your pocket.' },
  { value: 'mid', label: 'Standard · 3%', hint: 'A common, balanced choice.' },
  { value: 'high', label: 'Larger · 5%', hint: 'Signals to the seller that you’re serious.' },
];

export const INSPECTION_OPTIONS: ReadonlyArray<ChoiceOption<InspectionOption>> = [
  { value: 'full', label: 'Full inspection', hint: 'Keep your right to inspect and ask for repairs.' },
  { value: 'info', label: 'Inspection for info only', hint: 'You’ll still check the home, but won’t ask for repairs.' },
  { value: 'waived', label: 'Skip the inspection', hint: 'Appealing to sellers — but you take on any hidden issues.' },
];

export const FINANCING_OPTIONS: ReadonlyArray<ChoiceOption<FinancingOption>> = [
  { value: 'keep', label: 'Keep your loan safety net', hint: 'You can back out if your loan falls through.' },
  { value: 'waived', label: 'Waive your loan safety net', hint: 'More attractive to the seller — but your deposit is at risk if financing fails.' },
];

export const TIMELINE_OPTIONS: ReadonlyArray<ChoiceOption<Timeline>> = [
  { value: 'flexible', label: 'Flexible move-in', hint: 'Close on the seller’s preferred timeline.' },
  { value: 'standard', label: 'Standard timing', hint: 'A typical closing schedule.' },
  { value: 'needTime', label: 'I need extra time', hint: 'A longer runway before closing.' },
];

const CURRENCY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return CURRENCY.format(Math.round(value));
}

export type SafetyTone = 'good' | 'mid' | 'low' | 'over';

export function buyerSafetyLabel(safety: number, overextended: boolean): string {
  if (overextended) return 'Overextended';
  if (safety >= SAFETY_GREEN) return 'Comfortable';
  if (safety >= SAFETY_RED) return 'Stretched';
  return 'Risky';
}

export function buyerSafetyTone(safety: number, overextended: boolean): SafetyTone {
  if (overextended) return 'over';
  if (safety >= SAFETY_GREEN) return 'good';
  if (safety >= SAFETY_RED) return 'mid';
  return 'low';
}
