import { describe, expect, it } from 'vitest';
import type { Offer } from '../../state/types';
import { SCENARIOS } from '../../data/scenarios';
import { computeCounterfactual } from '../counterfactual';
import { scoreOffer } from '../scoreOffer';

const [R1, R2, R3] = SCENARIOS;

function offer(partial: Partial<Offer>): Offer {
  return {
    pricePct: 0,
    earnest: 'low',
    inspection: 'full',
    financing: 'keep',
    timeline: 'standard',
    ...partial,
  };
}

describe('computeCounterfactual', () => {
  it('LOST: surfaces the free timeline lever as the cheapest flip', () => {
    // R3 target is "flexible". This offer loses only because it ignores the close date.
    const losing = offer({ pricePct: 6, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'standard' });
    expect(scoreOffer(losing, R3).won).toBe(false);

    const cf = computeCounterfactual(losing, R3);
    expect(cf).not.toBeNull();
    expect(cf?.term).toBe('timeline');
    expect(cf?.flipsToWin).toBe(true);
    expect(cf?.riskDelta).toBe(0); // the free lever
    expect(cf?.appealDelta).toBeGreaterThan(0);
  });

  it('WON but acceptedRisky: suggests a single change that keeps the win with more safety', () => {
    const risky = offer({ pricePct: 3, earnest: 'high', inspection: 'waived', financing: 'waived', timeline: 'standard' });
    const result = scoreOffer(risky, R2);
    expect(result.outcome).toBe('acceptedRisky');

    const cf = computeCounterfactual(risky, R2);
    expect(cf).not.toBeNull();
    expect(cf?.flipsToWin).toBe(true);
    expect(cf?.riskDelta).toBeLessThan(0); // relaxes a risky lever
    // the chosen change must still win and must raise safety
    expect(cf?.term).toBe('inspection');
  });

  it('strongWin: returns null (nothing instructive to change)', () => {
    const strong = offer({ pricePct: 6, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'flexible' });
    expect(scoreOffer(strong, R3).outcome).toBe('strongWin');
    expect(computeCounterfactual(strong, R3)).toBeNull();
  });

  it('narrowWin: returns null', () => {
    const narrow = offer({ pricePct: 9, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'standard' });
    expect(scoreOffer(narrow, R1).outcome).toBe('narrowWin');
    expect(computeCounterfactual(narrow, R1)).toBeNull();
  });

  it('LOST with no single winning move: returns a nudge (flipsToWin=false)', () => {
    const weak = offer({ pricePct: 0, earnest: 'low', inspection: 'full', financing: 'keep', timeline: 'needTime' });
    expect(scoreOffer(weak, R2).won).toBe(false);

    const cf = computeCounterfactual(weak, R2);
    expect(cf).not.toBeNull();
    expect(cf?.flipsToWin).toBe(false);
    expect(cf?.message).toContain('No single change');
  });
});
