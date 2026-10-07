import { describe, expect, it } from 'vitest';
import type { CompetitorAppeal, Offer, Scenario } from '../../state/types';
import { classifyOutcome, determineWinner } from '../outcome';

function offer(partial: Partial<Offer> = {}): Offer {
  return {
    pricePct: 5,
    earnest: 'mid',
    inspection: 'full',
    financing: 'keep',
    timeline: 'standard',
    ...partial,
  };
}

/** Price-only seller (weight 1 on price) so appeal == 10 * pricePct — easy to reason about. */
function priceOnlyScenario(competitorOffers: [Offer, Offer, Offer]): Scenario {
  return {
    id: 'synthetic',
    roundIndex: 0,
    homeLabel: 'synthetic',
    listPrice: 100_000,
    comfortablePrice: 100_000,
    sellerNote: '',
    sellerTargetTimeline: 'standard',
    sellerWeights: { price: 1, earnest: 0, inspection: 0, financing: 0, timeline: 0 },
    competitors: [
      { id: 'c0', name: 'c0', persona: '', offer: competitorOffers[0] },
      { id: 'c1', name: 'c1', persona: '', offer: competitorOffers[1] },
      { id: 'c2', name: 'c2', persona: '', offer: competitorOffers[2] },
    ],
  };
}

const comps = (xs: Array<[string, number]>): CompetitorAppeal[] =>
  xs.map(([id, appeal]) => ({ id, appeal }));

describe('determineWinner — strict rule', () => {
  const scenario = priceOnlyScenario([offer({ pricePct: 5 }), offer({ pricePct: 4 }), offer({ pricePct: 3 })]);
  const appeals = comps([
    ['c0', 50],
    ['c1', 40],
    ['c2', 30],
  ]);

  it('player must STRICTLY exceed the best competitor', () => {
    expect(determineWinner(50, appeals, scenario).won).toBe(false); // tie loses
    expect(determineWinner(50.0001, appeals, scenario).won).toBe(true);
    expect(determineWinner(49.9, appeals, scenario).won).toBe(false);
  });

  it('reports margin relative to the best competitor', () => {
    expect(determineWinner(60, appeals, scenario).margin).toBeCloseTo(10, 6);
    expect(determineWinner(45, appeals, scenario).margin).toBeCloseTo(-5, 6);
  });

  it('winnerId is the player when the player wins', () => {
    expect(determineWinner(70, appeals, scenario).winnerId).toBe('player');
  });

  it('winnerId is NOT the player on a tie, even with a higher price/earnest', () => {
    // Player ties the best competitor on appeal but has the max price + earnest.
    const tieScenario = priceOnlyScenario([
      offer({ pricePct: 5, earnest: 'low' }),
      offer({ pricePct: 4 }),
      offer({ pricePct: 3 }),
    ]);
    const tieAppeals = comps([
      ['c0', 50],
      ['c1', 40],
      ['c2', 30],
    ]);
    const result = determineWinner(50, tieAppeals, tieScenario);
    expect(result.won).toBe(false);
    expect(result.winnerId).not.toBe('player');
    expect(result.winnerId).toBe('c0');
  });
});

describe('determineWinner — tie-break order', () => {
  it('on an appeal tie, higher pricePct then higher earnest wins; player ranks last', () => {
    // All three competitors score 50 appeal (price-only, pricePct 5). Player also 50 -> loses.
    const scenario = priceOnlyScenario([
      offer({ pricePct: 5, earnest: 'low' }),
      offer({ pricePct: 5, earnest: 'high' }), // same price, higher earnest -> should win the tie
      offer({ pricePct: 5, earnest: 'mid' }),
    ]);
    const appeals = comps([
      ['c0', 50],
      ['c1', 50],
      ['c2', 50],
    ]);
    const result = determineWinner(50, appeals, scenario);
    expect(result.won).toBe(false); // player tie -> loses
    expect(result.winnerId).toBe('c1'); // highest earnest among equal-price competitors
  });
});

describe('classifyOutcome — all six states', () => {
  it('overextended takes precedence over everything', () => {
    expect(classifyOutcome(true, 0, true, 50)).toBe('overextended');
    expect(classifyOutcome(false, 90, true, -5)).toBe('overextended');
  });

  it('strong vs narrow win depends on BOTH safety >= 70 AND margin >= 5', () => {
    expect(classifyOutcome(true, 80, false, 6)).toBe('strongWin');
    expect(classifyOutcome(true, 70, false, 5)).toBe('strongWin'); // boundaries inclusive
    expect(classifyOutcome(true, 80, false, 4)).toBe('narrowWin'); // margin too thin
    expect(classifyOutcome(true, 55, false, 10)).toBe('narrowWin'); // safety in yellow band
  });

  it('won with safety < 40 is acceptedRisky', () => {
    expect(classifyOutcome(true, 39, false, 20)).toBe('acceptedRisky');
    expect(classifyOutcome(true, 40, false, 20)).toBe('narrowWin'); // 40 is not < 40
  });

  it('losing splits on the green threshold', () => {
    expect(classifyOutcome(false, 70, false, -3)).toBe('rejectedHealthy');
    expect(classifyOutcome(false, 69, false, -3)).toBe('rejectedStretched');
  });
});
