/**
 * Offer Balance — game state machine.
 *
 * Pure, framework-free reducer that orchestrates the LOCKED engine. It stores
 * only the five fields in `GameState`; all scoring is delegated to
 * `scoreOffer` and never duplicated here. Illegal action/phase pairs return the
 * exact same state reference (no clone).
 */

import { DEFAULT_OFFER, scoreOffer } from '../engine';
import { SCENARIOS } from '../data/scenarios';
import type { GameAction } from './actions';
import type { GameState, RoundResult, ScoringResult } from './types';

export const TOTAL_ROUNDS = SCENARIOS.length;

/** Fresh initial state. Offer is spread so no two states share a mutable offer. */
export function createInitialState(): GameState {
  return {
    phase: 'intro',
    roundIndex: 0,
    offer: { ...DEFAULT_OFFER },
    currentResult: null,
    roundResults: [],
  };
}

/** Compact, stored snapshot of a completed round, derived from the scoring result. */
function toRoundResult(result: ScoringResult, roundIndex: number): RoundResult {
  return {
    scenarioId: result.scenarioId,
    roundIndex,
    outcome: result.outcome,
    won: result.won,
    buyerSafety: result.buyerSafety,
    sellerAppeal: result.playerAppeal,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (state.phase) {
    case 'intro':
      if (action.type === 'START_GAME') {
        return {
          phase: 'building',
          roundIndex: 0,
          offer: { ...DEFAULT_OFFER },
          currentResult: null,
          roundResults: [],
        };
      }
      return state;

    case 'building':
      if (action.type === 'UPDATE_OFFER') {
        return { ...state, offer: { ...state.offer, ...action.patch } };
      }
      if (action.type === 'SUBMIT_OFFER') {
        const scenario = SCENARIOS[state.roundIndex];
        const result = scoreOffer(state.offer, scenario);
        return { ...state, currentResult: result, phase: 'revealing' };
      }
      return state;

    case 'revealing':
      if (action.type === 'REVEAL_COMPLETE') {
        return { ...state, phase: 'debrief' };
      }
      return state;

    case 'debrief':
      if (action.type === 'NEXT_ROUND') {
        // currentResult is always present in debrief; guard defensively.
        if (state.currentResult === null) return state;

        const roundResults = [...state.roundResults, toRoundResult(state.currentResult, state.roundIndex)];
        const isFinalRound = state.roundIndex >= TOTAL_ROUNDS - 1;

        if (isFinalRound) {
          return { ...state, roundResults, phase: 'summary' };
        }
        return {
          phase: 'building',
          roundIndex: state.roundIndex + 1,
          offer: { ...DEFAULT_OFFER },
          currentResult: null,
          roundResults,
        };
      }
      return state;

    case 'summary':
      if (action.type === 'RESET_GAME') {
        return createInitialState();
      }
      return state;
  }
}
