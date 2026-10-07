import { describe, expect, it } from 'vitest';
import type { Offer, Scenario } from '../../state/types';
import { SCENARIOS } from '../../data/scenarios';
import { computeBuyerSafety, computePriceRisk, computeRisk } from '../risk';

const R1 = SCENARIOS[0]; // comfortablePrice === listPrice -> priceRisk = 3 * pricePct

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

describe('computePriceRisk', () => {
  it('is 3 * pricePct when comfortablePrice === listPrice', () => {
    for (let p = 0; p <= 10; p++) {
      expect(computePriceRisk(p, R1)).toBe(3 * p);
    }
  });

  it('clamps at the upper bound of 30', () => {
    const cheap: Scenario = { ...R1, listPrice: 100_000, comfortablePrice: 90_000 }; // comfortablePct = -10
    expect(computePriceRisk(0, cheap)).toBeCloseTo(30, 6); // 3 * (0 - (-10)) = 30 (float dust)
    expect(computePriceRisk(10, cheap)).toBe(30); // 3 * 20 = 60 -> clamped exactly to 30
  });

  it('clamps at the lower bound of 0', () => {
    const pricey: Scenario = { ...R1, listPrice: 100_000, comfortablePrice: 110_000 }; // comfortablePct = +10
    expect(computePriceRisk(0, pricey)).toBe(0); // 3 * (0 - 10) = -30 -> clamped
    expect(computePriceRisk(10, pricey)).toBe(0); // 3 * (10 - 10) = 0
  });
});

describe('computeRisk', () => {
  it('reads each term from the locked risk tables', () => {
    const risk = computeRisk(
      offer({ pricePct: 4, earnest: 'mid', inspection: 'info', financing: 'waived', timeline: 'flexible' }),
      R1,
    );
    expect(risk.price).toBe(12);
    expect(risk.earnest).toBe(10);
    expect(risk.inspection).toBe(15);
    expect(risk.financing).toBe(25);
    expect(risk.timeline).toBe(0);
    expect(risk.total).toBe(62);
    expect(risk.overextended).toBe(false);
  });

  it('timeline never costs risk', () => {
    for (const timeline of ['flexible', 'standard', 'needTime'] as const) {
      expect(computeRisk(offer({ timeline }), R1).timeline).toBe(0);
    }
  });

  it('flags overextended only above 100 (max is 105)', () => {
    const maxed = computeRisk(
      offer({ pricePct: 10, earnest: 'high', inspection: 'waived', financing: 'waived' }),
      R1,
    );
    expect(maxed.total).toBe(105);
    expect(maxed.overextended).toBe(true);

    const atEighty = computeRisk(
      offer({ pricePct: 10, earnest: 'high', inspection: 'waived', financing: 'keep' }),
      R1,
    );
    expect(atEighty.total).toBe(80);
    expect(atEighty.overextended).toBe(false);
  });
});

describe('computeBuyerSafety', () => {
  it('is 100 - total, clamped to [0, 100]', () => {
    expect(computeBuyerSafety(computeRisk(offer({ pricePct: 3, earnest: 'mid' }), R1))).toBe(81);
    expect(computeBuyerSafety(computeRisk(offer(), R1))).toBe(98); // low earnest only
  });

  it('never goes below 0 even when overextended', () => {
    const maxed = computeRisk(
      offer({ pricePct: 10, earnest: 'high', inspection: 'waived', financing: 'waived' }),
      R1,
    );
    expect(computeBuyerSafety(maxed)).toBe(0);
  });

  it('lands in the expected bands', () => {
    expect(computeBuyerSafety(computeRisk(offer({ pricePct: 3 }), R1))).toBeGreaterThanOrEqual(70); // green
    expect(computeBuyerSafety(computeRisk(offer({ pricePct: 8, earnest: 'mid', inspection: 'info' }), R1))).toBeLessThan(70); // 24+10+15=49 -> 51 yellow
  });
});
