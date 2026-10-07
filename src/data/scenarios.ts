/**
 * The three frozen scenarios (ENGINE SPEC — LOCKED v1.0 §7).
 * Values are authoritative; do not edit without re-freezing the spec.
 * comfortablePrice === listPrice in the MVP (comfortablePct = 0).
 */

import type { Scenario } from '../state/types';

export const SCENARIOS: readonly [Scenario, Scenario, Scenario] = [
  {
    id: 'r1-top-dollar',
    roundIndex: 0,
    homeLabel: 'Round 1 — Top-Dollar',
    listPrice: 400_000,
    comfortablePrice: 400_000,
    sellerNote: 'The seller wants the strongest possible price and expects a standard close.',
    sellerTargetTimeline: 'standard',
    sellerWeights: { price: 0.5, earnest: 0.15, inspection: 0.15, financing: 0.1, timeline: 0.1 },
    competitors: [
      {
        id: 'ava',
        name: 'Ava — the Over-Bidder',
        persona: 'Throws money at it.',
        offer: { pricePct: 7, earnest: 'mid', inspection: 'full', financing: 'keep', timeline: 'standard' },
      },
      {
        id: 'hendersons',
        name: 'The Hendersons — Safe & Certain',
        persona: 'Conservative; strong guarantees.',
        offer: { pricePct: 3, earnest: 'high', inspection: 'info', financing: 'waived', timeline: 'standard' },
      },
      {
        id: 'raj',
        name: 'Raj — the Closer',
        persona: 'Flexible, deal-oriented.',
        offer: { pricePct: 5, earnest: 'mid', inspection: 'info', financing: 'keep', timeline: 'flexible' },
      },
    ],
  },
  {
    id: 'r2-certainty',
    roundIndex: 1,
    homeLabel: 'Round 2 — Certainty-First',
    listPrice: 350_000,
    comfortablePrice: 350_000,
    sellerNote:
      'The seller was burned by a deal that fell through and wants a sure thing — a standard close is fine.',
    sellerTargetTimeline: 'standard',
    sellerWeights: { price: 0.2, earnest: 0.2, inspection: 0.25, financing: 0.25, timeline: 0.1 },
    competitors: [
      {
        id: 'hendersons',
        name: 'The Hendersons — Safe & Certain',
        persona: 'Conservative; strong guarantees.',
        offer: { pricePct: 3, earnest: 'high', inspection: 'info', financing: 'keep', timeline: 'standard' },
      },
      {
        id: 'ava',
        name: 'Ava — the Over-Bidder',
        persona: 'Throws money at it.',
        offer: { pricePct: 8, earnest: 'mid', inspection: 'full', financing: 'keep', timeline: 'standard' },
      },
      {
        id: 'raj',
        name: 'Raj — the Closer',
        persona: 'Flexible, deal-oriented.',
        offer: { pricePct: 4, earnest: 'mid', inspection: 'info', financing: 'keep', timeline: 'flexible' },
      },
    ],
  },
  {
    id: 'r3-fast-close',
    roundIndex: 2,
    homeLabel: 'Round 3 — Fast-Close',
    listPrice: 500_000,
    comfortablePrice: 500_000,
    sellerNote:
      'The seller has already bought their next home and must close fast — flexibility on the closing date matters most.',
    sellerTargetTimeline: 'flexible',
    sellerWeights: { price: 0.25, earnest: 0.1, inspection: 0.15, financing: 0.1, timeline: 0.4 },
    competitors: [
      {
        id: 'hendersons',
        name: 'The Hendersons — Safe & Certain',
        persona: 'Conservative; strong guarantees.',
        offer: { pricePct: 3, earnest: 'high', inspection: 'info', financing: 'waived', timeline: 'standard' },
      },
      {
        id: 'raj',
        name: 'Raj — the Closer',
        persona: 'Flexible, deal-oriented.',
        offer: { pricePct: 3, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'flexible' },
      },
      {
        id: 'ava',
        name: 'Ava — the Over-Bidder',
        persona: 'Throws money at it.',
        offer: { pricePct: 8, earnest: 'mid', inspection: 'full', financing: 'keep', timeline: 'standard' },
      },
    ],
  },
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);
