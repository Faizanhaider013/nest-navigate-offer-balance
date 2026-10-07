/**
 * GameProvider — the single React access point to the locked state machine.
 * Wraps the reducer in context; no extra state library, no persistence.
 */

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { GameAction } from '../state/actions';
import { createInitialState, gameReducer } from '../state/reducer';
import type { GameState } from '../state/types';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (ctx === null) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
