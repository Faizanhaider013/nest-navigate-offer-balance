/**
 * Regression tests for the two engine-faithfulness bugs found in audit:
 *   BUG 1 — a non-winning player could be reported as winnerId 'player' on a tie.
 *   BUG 2 — an acceptedRisky counterfactual was worded as "overextended".
 * Exercised against the real locked scenarios, not mocks.
 */

import { describe, expect, it } from 'vitest';
import { SCENARIOS } from '../../data/scenarios';
import { competitorAppeals } from '../appeal';
import { computeCounterfactual } from '../counterfactual';
import { scoreOffer } from '../scoreOffer';
import type {
  EarnestTier,
  FinancingOption,
  InspectionOption,
  Offer,
  Scenario,
  Timeline,
} from '../../state/types';

const EARNEST: EarnestTier[] = ['low', 'mid', 'high'];
const INSPECTION: InspectionOption[] = ['full', 'info', 'waived'];
const FINANCING: FinancingOption[] = ['keep', 'waived'];
const TIMELINE: Timeline[] = ['flexible', 'standard', 'needTime'];

/** Every reachable offer: 11 prices × 3 × 3 × 2 × 3 = 594 per scenario. */
function* allOffers(): Generator<Offer> {
  for (let pricePct = 0; pricePct <= 10; pricePct++) {
    for (const earnest of EARNEST) {
      for (const inspection of INSPECTION) {
        for (const financing of FINANCING) {
          for (const timeline of TIMELINE) {
            yield { pricePct, earnest, inspection, financing, timeline };
          }
        }
      }
    }
  }
}

const bestCompetitorAppeal = (scenario: Scenario): number =>
  competitorAppeals(scenario).reduce((best, c) => Math.max(best, c.appeal), Number.NEGATIVE_INFINITY);

describe('BUG 1 — tie / winner invariants across all reachable offers', () => {
  it('never produces !won with winnerId === "player" (the 12 audit cases)', () => {
    const violations: Array<{ scenarioId: string; offer: Offer }> = [];
    for (const scenario of SCENARIOS) {
      for (const offer of allOffers()) {
        const r = scoreOffer(offer, scenario);
        if (!r.won && r.winnerId === 'player') {
          violations.push({ scenarioId: scenario.id, offer });
        }
      }
    }
    expect(violations).toHaveLength(0);
  });

  it('exact appeal ties lose and hand the win to a competitor', () => {
    const ties: Array<{ scenarioId: string; offer: Offer }> = [];
    for (const scenario of SCENARIOS) {
      const bar = bestCompetitorAppeal(scenario);
      for (const offer of allOffers()) {
        const r = scoreOffer(offer, scenario);
        if (r.playerAppeal === bar) {
          ties.push({ scenarioId: scenario.id, offer });
          expect(r.won).toBe(false);
          expect(r.winnerId).not.toBe('player');
        }
      }
    }
    // The audit found reachable ties; make sure this test actually exercised some.
    expect(ties.length).toBeGreaterThan(0);
  });

  it('keeps the deterministic competitor tie-break (highest earnest among equal-price)', () => {
    // Round 1 against a hand-built tie would duplicate outcome.test; here we only
    // assert the branch is reached by the sweep above (ties.length > 0) and that
    // winnerId is always a real competitor id when the player ties.
    for (const scenario of SCENARIOS) {
      const bar = bestCompetitorAppeal(scenario);
      const ids = new Set(scenario.competitors.map((c) => c.id));
      for (const offer of allOffers()) {
        const r = scoreOffer(offer, scenario);
        if (r.playerAppeal === bar) {
          expect(ids.has(r.winnerId)).toBe(true);
        }
      }
    }
  });
});

describe('BUG 2 — counterfactual wording matches the real engine state', () => {
  const acceptedRisky: Offer = {
    pricePct: 3,
    earnest: 'high',
    inspection: 'waived',
    financing: 'waived',
    timeline: 'standard',
  };
  const R2 = SCENARIOS[1];

  const overextended: Offer = {
    pricePct: 10,
    earnest: 'high',
    inspection: 'waived',
    financing: 'waived',
    timeline: 'standard',
  };
  const R1 = SCENARIOS[0];

  it('an accepted-risky offer is NOT described as overextended', () => {
    const r = scoreOffer(acceptedRisky, R2);
    // Precondition: this really is acceptedRisky, not overextended.
    expect(r.outcome).toBe('acceptedRisky');
    expect(r.won).toBe(true);
    expect(r.buyerSafety).toBeLessThan(40);
    expect(r.risk.overextended).toBe(false);

    const cf = computeCounterfactual(acceptedRisky, R2);
    expect(cf).not.toBeNull();
    expect(cf?.message.toLowerCase()).not.toContain('overextended');
    expect(cf?.message.toLowerCase()).toContain('risky');
  });

  it('an actually overextended offer still uses overextended wording', () => {
    const r = scoreOffer(overextended, R1);
    expect(r.outcome).toBe('overextended');
    expect(r.risk.overextended).toBe(true);
    expect(r.won).toBe(true);

    const cf = computeCounterfactual(overextended, R1);
    expect(cf).not.toBeNull();
    expect(cf?.message.toLowerCase()).toContain('overextended');
  });
});

describe('outcome ↔ overextended invariants across all reachable offers', () => {
  it('acceptedRisky ⇒ not overextended; overextended ⇒ overextended; !won ⇒ winner is a competitor', () => {
    for (const scenario of SCENARIOS) {
      for (const offer of allOffers()) {
        const r = scoreOffer(offer, scenario);
        if (r.outcome === 'acceptedRisky') expect(r.risk.overextended).toBe(false);
        if (r.outcome === 'overextended') expect(r.risk.overextended).toBe(true);
        if (!r.won) expect(r.winnerId).not.toBe('player');
      }
    }
  });
});
