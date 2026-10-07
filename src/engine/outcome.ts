/**
 * Winner / tie-break (ENGINE SPEC §10) and outcome classification (§11).
 *
 * won    = playerAppeal > bestCompetitorAppeal   // STRICT; a tie is NOT a win
 * margin = playerAppeal - bestCompetitorAppeal
 *
 * The player is reported as winner ONLY when they strictly win. On a loss OR a
 * tie the winner is the top competitor by the deterministic competitor
 * ordering (appeal desc -> pricePct desc -> earnest rank desc -> array order).
 * This guarantees the invariant:  !won  =>  winnerId !== 'player'.
 */

import type { CompetitorAppeal, OutcomeKind, Scenario } from '../state/types';
import { EARNEST_RANK, NARROW_MARGIN, SAFETY_GREEN, SAFETY_RED } from './config';

export interface WinnerResult {
  winnerId: string; // 'player' | competitor.id
  won: boolean;
  margin: number;
}

const PLAYER_ID = 'player';

export function determineWinner(
  playerAppeal: number,
  competitorAppeals: readonly CompetitorAppeal[],
  scenario: Scenario,
): WinnerResult {
  const bestCompetitorAppeal = competitorAppeals.reduce(
    (best, c) => Math.max(best, c.appeal),
    Number.NEGATIVE_INFINITY,
  );
  const won = playerAppeal > bestCompetitorAppeal; // STRICT: a tie is not a win
  const margin = playerAppeal - bestCompetitorAppeal;

  if (won) {
    return { winnerId: PLAYER_ID, won, margin };
  }

  // Loss or tie: the winner is the best competitor, chosen deterministically.
  const topCompetitor = scenario.competitors
    .map((competitor, index) => ({
      id: competitor.id,
      appeal: competitorAppeals.find((c) => c.id === competitor.id)?.appeal ?? 0,
      pricePct: competitor.offer.pricePct,
      earnestRank: EARNEST_RANK[competitor.offer.earnest],
      index,
    }))
    .sort(
      (a, b) =>
        b.appeal - a.appeal ||
        b.pricePct - a.pricePct ||
        b.earnestRank - a.earnestRank ||
        a.index - b.index,
    )[0];

  return { winnerId: topCompetitor.id, won, margin };
}

export function classifyOutcome(
  won: boolean,
  buyerSafety: number,
  overextended: boolean,
  margin: number,
): OutcomeKind {
  if (overextended) return 'overextended';
  if (won) {
    if (buyerSafety < SAFETY_RED) return 'acceptedRisky';
    if (buyerSafety >= SAFETY_GREEN && margin >= NARROW_MARGIN) return 'strongWin';
    return 'narrowWin';
  }
  if (buyerSafety >= SAFETY_GREEN) return 'rejectedHealthy';
  return 'rejectedStretched';
}
