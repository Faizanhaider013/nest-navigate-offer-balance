/**
 * Offer Balance — reducer actions.
 * Exactly the six actions in the state-machine spec; no others.
 */

import type { Offer } from './types';

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'UPDATE_OFFER'; patch: Partial<Offer> }
  | { type: 'SUBMIT_OFFER' }
  | { type: 'REVEAL_COMPLETE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESET_GAME' };

export type GameActionType = GameAction['type'];
