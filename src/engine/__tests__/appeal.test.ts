import { describe, expect, it } from 'vitest';
import type { Offer } from '../../state/types';
import { SCENARIOS } from '../../data/scenarios';
import { competitorAppeals, computeAppeal, priceScore, termScore, timelineScore } from '../appeal';

const [R1, R2, R3] = SCENARIOS;

function offer(partial: Partial<Offer> = {}): Offer {
  return {
    pricePct: 0,
    earnest: 'low',
    inspection: 'full',
    financing: 'keep',
    timeline: 'standard',
    ...partial,
  };
}

describe('term scores', () => {
  it('price = 10 * pricePct', () => {
    expect(priceScore(0)).toBe(0);
    expect(priceScore(7)).toBe(70);
    expect(priceScore(10)).toBe(100);
  });

  it('timeline scores 100 on a match, else the fallback', () => {
    expect(timelineScore('standard', 'standard')).toBe(100);
    expect(timelineScore('flexible', 'standard')).toBe(70);
    expect(timelineScore('needTime', 'standard')).toBe(20);
    expect(timelineScore('flexible', 'flexible')).toBe(100);
    expect(timelineScore('standard', 'flexible')).toBe(50);
  });

  it('maps earnest / inspection / financing to the locked scores', () => {
    expect(termScore('earnest', offer({ earnest: 'high' }), R1)).toBe(100);
    expect(termScore('inspection', offer({ inspection: 'info' }), R1)).toBe(60);
    expect(termScore('financing', offer({ financing: 'waived' }), R1)).toBe(100);
  });
});

describe('computeAppeal', () => {
  it('is a weighted sum in [0, 100]', () => {
    const { total, contributions } = computeAppeal(
      offer({ pricePct: 9, timeline: 'standard' }),
      R1,
    );
    // .5*90 + .15*30 + .15*20 + .1*20 + .1*100
    expect(total).toBeCloseTo(64.5, 6);
    expect(contributions.price.contribution).toBeCloseTo(45, 6);
    expect(contributions.timeline.termScore).toBe(100);
  });

  it('stays within bounds at the extremes', () => {
    const min = computeAppeal(offer({ pricePct: 0, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'needTime' }), R1).total;
    const max = computeAppeal(offer({ pricePct: 10, earnest: 'high', inspection: 'waived', financing: 'waived', timeline: 'standard' }), R1).total;
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThanOrEqual(100);
  });
});

describe('competitorAppeals (golden §7 bars)', () => {
  it('Round 1 — Top-Dollar', () => {
    const map = Object.fromEntries(competitorAppeals(R1).map((c) => [c.id, c.appeal]));
    expect(map.ava).toBeCloseTo(59.75, 6);
    expect(map.hendersons).toBeCloseTo(59.0, 6);
    expect(map.raj).toBeCloseTo(52.75, 6);
  });

  it('Round 2 — Certainty-First', () => {
    const map = Object.fromEntries(competitorAppeals(R2).map((c) => [c.id, c.appeal]));
    expect(map.hendersons).toBeCloseTo(56.0, 6);
    expect(map.ava).toBeCloseTo(49.0, 6);
    expect(map.raj).toBeCloseTo(48.0, 6);
  });

  it('Round 3 — Fast-Close', () => {
    const map = Object.fromEntries(competitorAppeals(R3).map((c) => [c.id, c.appeal]));
    expect(map.hendersons).toBeCloseTo(56.5, 6);
    expect(map.raj).toBeCloseTo(55.5, 6);
    expect(map.ava).toBeCloseTo(51.5, 6);
  });
});
