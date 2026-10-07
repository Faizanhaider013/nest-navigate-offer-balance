import { describe, expect, it } from 'vitest';
import type { Offer, OutcomeKind, Scenario } from '../../state/types';
import { SCENARIOS } from '../../data/scenarios';
import { MAX_TOTAL_RISK } from '../config';
import { scoreOffer } from '../scoreOffer';

const [R1, R2, R3] = SCENARIOS;

interface GoldenRow {
  label: string;
  scenario: Scenario;
  offer: Offer;
  total: number;
  safety: number;
  appeal: number;
  won: boolean;
  outcome: OutcomeKind;
}

// Exactly the worked examples from ENGINE SPEC — LOCKED v1.0 §13.
const GOLDEN: GoldenRow[] = [
  { label: '1  R1 narrowWin', scenario: R1, offer: { pricePct: 9, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'standard' }, total: 29, safety: 71, appeal: 64.5, won: true, outcome: 'narrowWin' },
  { label: '2  R1 rejectedHealthy', scenario: R1, offer: { pricePct: 3, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'standard' }, total: 11, safety: 89, appeal: 34.5, won: false, outcome: 'rejectedHealthy' },
  { label: '3  R1 acceptedRisky', scenario: R1, offer: { pricePct: 8, earnest: 'high', inspection: 'waived', financing: 'keep', timeline: 'standard' }, total: 74, safety: 26, appeal: 82, won: true, outcome: 'acceptedRisky' },
  { label: '4  R1 overextended', scenario: R1, offer: { pricePct: 10, earnest: 'high', inspection: 'waived', financing: 'waived', timeline: 'standard' }, total: 105, safety: 0, appeal: 100, won: true, outcome: 'overextended' },
  { label: '5  R2 rejectedHealthy', scenario: R2, offer: { pricePct: 3, earnest: 'high', inspection: 'full', financing: 'keep', timeline: 'standard' }, total: 29, safety: 71, appeal: 46, won: false, outcome: 'rejectedHealthy' },
  { label: '6  R2 narrowWin', scenario: R2, offer: { pricePct: 4, earnest: 'high', inspection: 'info', financing: 'keep', timeline: 'standard' }, total: 47, safety: 53, appeal: 58, won: true, outcome: 'narrowWin' },
  { label: '7  R2 acceptedRisky', scenario: R2, offer: { pricePct: 3, earnest: 'high', inspection: 'waived', financing: 'waived', timeline: 'standard' }, total: 84, safety: 16, appeal: 86, won: true, outcome: 'acceptedRisky' },
  { label: '8  R3 strongWin', scenario: R3, offer: { pricePct: 6, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'flexible' }, total: 20, safety: 80, appeal: 63, won: true, outcome: 'strongWin' },
  { label: '9  R3 rejectedHealthy', scenario: R3, offer: { pricePct: 3, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'standard' }, total: 11, safety: 89, appeal: 35.5, won: false, outcome: 'rejectedHealthy' },
  { label: '10 R3 narrowWin', scenario: R3, offer: { pricePct: 5, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'flexible' }, total: 17, safety: 83, appeal: 60.5, won: true, outcome: 'narrowWin' },
  { label: '11 R3 rejectedStretched', scenario: R3, offer: { pricePct: 2, earnest: 'high', inspection: 'waived', financing: 'keep', timeline: 'standard' }, total: 56, safety: 44, appeal: 52, won: false, outcome: 'rejectedStretched' },
];

describe('scoreOffer — golden §13 examples reproduce the frozen spec', () => {
  for (const row of GOLDEN) {
    it(row.label, () => {
      const r = scoreOffer(row.offer, row.scenario);
      expect(r.risk.total).toBe(row.total);
      expect(r.buyerSafety).toBe(row.safety);
      expect(r.playerAppeal).toBeCloseTo(row.appeal, 6);
      expect(r.won).toBe(row.won);
      expect(r.outcome).toBe(row.outcome);
    });
  }

  it('covers all six outcome kinds across the golden set', () => {
    const kinds = new Set(GOLDEN.map((g) => scoreOffer(g.offer, g.scenario).outcome));
    expect(kinds).toEqual(
      new Set<OutcomeKind>([
        'strongWin',
        'narrowWin',
        'acceptedRisky',
        'rejectedHealthy',
        'rejectedStretched',
        'overextended',
      ]),
    );
  });
});

describe('scoreOffer — determinism', () => {
  it('produces identical results on repeated execution', () => {
    const offer: Offer = { pricePct: 6, earnest: 'mid', inspection: 'info', financing: 'waived', timeline: 'flexible' };
    expect(scoreOffer(offer, R3)).toEqual(scoreOffer(offer, R3));
  });

  it('does not mutate its inputs', () => {
    const offer: Offer = { pricePct: 4, earnest: 'mid', inspection: 'full', financing: 'keep', timeline: 'standard' };
    const snapshot = JSON.stringify(offer);
    scoreOffer(offer, R2);
    expect(JSON.stringify(offer)).toBe(snapshot);
  });

  it('returns the submitted offer and scenario id', () => {
    const offer: Offer = { pricePct: 3, earnest: 'mid', inspection: 'full', financing: 'keep', timeline: 'standard' };
    const r = scoreOffer(offer, R1);
    expect(r.offer).toEqual(offer);
    expect(r.scenarioId).toBe('r1-top-dollar');
  });
});

describe('scenario & result invariants', () => {
  it('every seller weight set sums to exactly 1', () => {
    for (const s of SCENARIOS) {
      const sum = Object.values(s.sellerWeights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });

  it('every scenario has exactly 3 competitors with integer pricePct in 0..10', () => {
    for (const s of SCENARIOS) {
      expect(s.competitors).toHaveLength(3);
      for (const c of s.competitors) {
        expect(Number.isInteger(c.offer.pricePct)).toBe(true);
        expect(c.offer.pricePct).toBeGreaterThanOrEqual(0);
        expect(c.offer.pricePct).toBeLessThanOrEqual(10);
      }
    }
  });

  it('scoring results stay within expected bounds for every integer price', () => {
    for (const s of SCENARIOS) {
      for (let p = 0; p <= 10; p++) {
        const r = scoreOffer(
          { pricePct: p, earnest: 'mid', inspection: 'info', financing: 'waived', timeline: 'standard' },
          s,
        );
        expect(r.buyerSafety).toBeGreaterThanOrEqual(0);
        expect(r.buyerSafety).toBeLessThanOrEqual(100);
        expect(r.playerAppeal).toBeGreaterThanOrEqual(0);
        expect(r.playerAppeal).toBeLessThanOrEqual(100);
        expect(r.risk.total).toBeGreaterThanOrEqual(0);
        expect(r.risk.total).toBeLessThanOrEqual(MAX_TOTAL_RISK);
        expect(r.competitorAppeals).toHaveLength(3);
      }
    }
  });
});
