import { describe, expect, it } from 'vitest';
import { DEFAULT_OFFER, scoreOffer } from '../../engine';
import { SCENARIOS } from '../../data/scenarios';
import type { GameAction } from '../actions';
import { createInitialState, gameReducer, TOTAL_ROUNDS } from '../reducer';
import type { GameState, Offer } from '../types';

// --- action constructors ---
const START_GAME: GameAction = { type: 'START_GAME' };
const SUBMIT_OFFER: GameAction = { type: 'SUBMIT_OFFER' };
const REVEAL_COMPLETE: GameAction = { type: 'REVEAL_COMPLETE' };
const NEXT_ROUND: GameAction = { type: 'NEXT_ROUND' };
const RESET_GAME: GameAction = { type: 'RESET_GAME' };
const updateOffer = (patch: Partial<Offer>): GameAction => ({ type: 'UPDATE_OFFER', patch });

// --- helpers to reach a given phase through legal transitions ---
const buildingState = (): GameState => gameReducer(createInitialState(), START_GAME);
const revealingState = (): GameState => gameReducer(buildingState(), SUBMIT_OFFER);
const debriefState = (): GameState => gameReducer(revealingState(), REVEAL_COMPLETE);
const summaryState = (): GameState => {
  let s = createInitialState();
  s = gameReducer(s, START_GAME);
  for (let r = 0; r < TOTAL_ROUNDS; r++) {
    s = gameReducer(s, SUBMIT_OFFER);
    s = gameReducer(s, REVEAL_COMPLETE);
    s = gameReducer(s, NEXT_ROUND);
  }
  return s;
};

const snapshot = (value: unknown): string => JSON.stringify(value);

describe('A. initial state', () => {
  it('is a clean intro state', () => {
    expect(createInitialState()).toEqual({
      phase: 'intro',
      roundIndex: 0,
      offer: DEFAULT_OFFER,
      currentResult: null,
      roundResults: [],
    });
  });

  it('does not share a mutable offer reference between instances', () => {
    expect(createInitialState().offer).not.toBe(createInitialState().offer);
  });
});

describe('B. START_GAME', () => {
  it('moves intro -> building with a fresh round 0', () => {
    const s = gameReducer(createInitialState(), START_GAME);
    expect(s.phase).toBe('building');
    expect(s.roundIndex).toBe(0);
    expect(s.offer).toEqual(DEFAULT_OFFER);
    expect(s.currentResult).toBeNull();
    expect(s.roundResults).toEqual([]);
  });
});

describe('C. UPDATE_OFFER', () => {
  it('merges a single-field patch, preserving the rest', () => {
    const s = gameReducer(buildingState(), updateOffer({ pricePct: 6 }));
    expect(s.offer).toEqual({ ...DEFAULT_OFFER, pricePct: 6 });
    expect(s.phase).toBe('building');
  });

  it('merges a multi-field patch', () => {
    const s = gameReducer(buildingState(), updateOffer({ inspection: 'waived', financing: 'waived', timeline: 'flexible' }));
    expect(s.offer).toEqual({ ...DEFAULT_OFFER, inspection: 'waived', financing: 'waived', timeline: 'flexible' });
  });

  it('applies sequential patches cumulatively', () => {
    let s = buildingState();
    s = gameReducer(s, updateOffer({ pricePct: 8 }));
    s = gameReducer(s, updateOffer({ earnest: 'high' }));
    expect(s.offer).toEqual({ ...DEFAULT_OFFER, pricePct: 8, earnest: 'high' });
  });

  it('does not mutate the previous state or offer', () => {
    const prev = buildingState();
    const before = snapshot(prev);
    const next = gameReducer(prev, updateOffer({ pricePct: 9 }));
    expect(snapshot(prev)).toBe(before);
    expect(next).not.toBe(prev);
    expect(next.offer).not.toBe(prev.offer);
  });
});

describe('D. SUBMIT_OFFER', () => {
  it('scores the current offer against the scenario for roundIndex and moves to revealing', () => {
    const building = gameReducer(buildingState(), updateOffer({ pricePct: 9, earnest: 'low' }));
    const s = gameReducer(building, SUBMIT_OFFER);
    expect(s.phase).toBe('revealing');
    expect(s.currentResult).not.toBeNull();
    expect(s.currentResult).toEqual(scoreOffer(building.offer, SCENARIOS[0]));
    expect(s.currentResult?.scenarioId).toBe('r1-top-dollar');
  });

  it('snapshots the result so later offers cannot change it', () => {
    const building = gameReducer(buildingState(), updateOffer({ pricePct: 9 }));
    const submitted = gameReducer(building, SUBMIT_OFFER);
    const frozen = snapshot(submitted.currentResult);
    // a subsequent round starts a brand-new offer; the old snapshot is untouched
    const back = gameReducer(gameReducer(submitted, REVEAL_COMPLETE), NEXT_ROUND);
    const edited = gameReducer(back, updateOffer({ pricePct: 0, earnest: 'high' }));
    void edited;
    expect(snapshot(submitted.currentResult)).toBe(frozen);
  });

  it('does not mutate the previous state', () => {
    const prev = buildingState();
    const before = snapshot(prev);
    gameReducer(prev, SUBMIT_OFFER);
    expect(snapshot(prev)).toBe(before);
  });
});

describe('E. REVEAL_COMPLETE', () => {
  it('moves revealing -> debrief and changes nothing else', () => {
    const prev = revealingState();
    const s = gameReducer(prev, REVEAL_COMPLETE);
    expect(s.phase).toBe('debrief');
    expect(s.roundIndex).toBe(prev.roundIndex);
    expect(s.offer).toBe(prev.offer);
    expect(s.currentResult).toBe(prev.currentResult);
    expect(s.roundResults).toBe(prev.roundResults);
  });
});

describe('F. NEXT_ROUND', () => {
  it('round 1 -> round 2, appending exactly one result and resetting the offer', () => {
    const prev = debriefState(); // roundIndex 0, has currentResult
    const s = gameReducer(prev, NEXT_ROUND);
    expect(s.phase).toBe('building');
    expect(s.roundIndex).toBe(1);
    expect(s.offer).toEqual(DEFAULT_OFFER);
    expect(s.currentResult).toBeNull();
    expect(s.roundResults).toHaveLength(1);
    expect(s.roundResults[0].scenarioId).toBe('r1-top-dollar');
  });

  it('round 2 -> round 3', () => {
    let s = debriefState();
    s = gameReducer(s, NEXT_ROUND); // -> building r2
    s = gameReducer(s, SUBMIT_OFFER);
    s = gameReducer(s, REVEAL_COMPLETE); // debrief r2
    s = gameReducer(s, NEXT_ROUND); // -> building r3
    expect(s.phase).toBe('building');
    expect(s.roundIndex).toBe(2);
    expect(s.roundResults).toHaveLength(2);
    expect(s.roundResults.map((r) => r.scenarioId)).toEqual(['r1-top-dollar', 'r2-certainty']);
  });

  it('final round -> summary, keeping exactly 3 results and not starting another round', () => {
    const s = summaryState();
    expect(s.phase).toBe('summary');
    expect(s.roundIndex).toBe(2); // not incremented past the last round
    expect(s.roundResults).toHaveLength(3);
    expect(s.roundResults.map((r) => r.scenarioId)).toEqual([
      'r1-top-dollar',
      'r2-certainty',
      'r3-fast-close',
    ]);
    expect(s.currentResult).not.toBeNull(); // final result preserved on the summary
  });

  it('does not mutate the previous state', () => {
    const prev = debriefState();
    const before = snapshot(prev);
    const next = gameReducer(prev, NEXT_ROUND);
    expect(snapshot(prev)).toBe(before);
    expect(next.roundResults).not.toBe(prev.roundResults);
  });
});

describe('G. RESET_GAME', () => {
  it('returns a clean initial state from summary', () => {
    const prev = summaryState();
    const before = snapshot(prev);
    const s = gameReducer(prev, RESET_GAME);
    expect(s).toEqual(createInitialState());
    expect(snapshot(prev)).toBe(before); // previous state untouched
  });
});

describe('H. illegal actions return the exact same state reference', () => {
  const cases: Array<{ phase: string; state: () => GameState; illegal: GameAction[] }> = [
    {
      phase: 'intro',
      state: createInitialState,
      illegal: [updateOffer({ pricePct: 5 }), SUBMIT_OFFER, REVEAL_COMPLETE, NEXT_ROUND, RESET_GAME],
    },
    {
      phase: 'building',
      state: buildingState,
      illegal: [START_GAME, REVEAL_COMPLETE, NEXT_ROUND, RESET_GAME],
    },
    {
      phase: 'revealing',
      state: revealingState,
      illegal: [START_GAME, updateOffer({ pricePct: 5 }), SUBMIT_OFFER, NEXT_ROUND, RESET_GAME],
    },
    {
      phase: 'debrief',
      state: debriefState,
      illegal: [START_GAME, updateOffer({ pricePct: 5 }), SUBMIT_OFFER, REVEAL_COMPLETE, RESET_GAME],
    },
    {
      phase: 'summary',
      state: summaryState,
      illegal: [START_GAME, updateOffer({ pricePct: 5 }), SUBMIT_OFFER, REVEAL_COMPLETE, NEXT_ROUND],
    },
  ];

  for (const { phase, state, illegal } of cases) {
    for (const action of illegal) {
      it(`${phase} + ${action.type} -> same reference`, () => {
        const s = state();
        expect(gameReducer(s, action)).toBe(s);
      });
    }
  }
});

describe('I. full happy-path integration', () => {
  it('plays three rounds and resets to a clean intro', () => {
    const patches = [
      { pricePct: 9, earnest: 'low' } as const, // R1
      { pricePct: 4, earnest: 'high', inspection: 'info' } as const, // R2
      { pricePct: 6, timeline: 'flexible' } as const, // R3
    ];
    const expectedIds = ['r1-top-dollar', 'r2-certainty', 'r3-fast-close'];

    let s = createInitialState();
    expect(s.phase).toBe('intro');

    s = gameReducer(s, START_GAME);
    expect(s.phase).toBe('building');
    expect(s.roundIndex).toBe(0);

    for (let r = 0; r < TOTAL_ROUNDS; r++) {
      s = gameReducer(s, updateOffer(patches[r]));
      const offerForRound = s.offer;

      s = gameReducer(s, SUBMIT_OFFER);
      expect(s.phase).toBe('revealing');
      expect(s.currentResult).toEqual(scoreOffer(offerForRound, SCENARIOS[r]));

      s = gameReducer(s, REVEAL_COMPLETE);
      expect(s.phase).toBe('debrief');

      s = gameReducer(s, NEXT_ROUND);
      expect(s.roundResults).toHaveLength(r + 1);

      if (r < TOTAL_ROUNDS - 1) {
        expect(s.phase).toBe('building');
        expect(s.roundIndex).toBe(r + 1);
        expect(s.offer).toEqual(DEFAULT_OFFER);
        expect(s.currentResult).toBeNull();
      }
    }

    expect(s.phase).toBe('summary');
    expect(s.roundResults).toHaveLength(3);
    expect(s.roundResults.map((rr) => rr.scenarioId)).toEqual(expectedIds);
    // no duplicated results: each round index appears exactly once
    expect(s.roundResults.map((rr) => rr.roundIndex)).toEqual([0, 1, 2]);

    s = gameReducer(s, RESET_GAME);
    expect(s).toEqual(createInitialState());
  });
});
