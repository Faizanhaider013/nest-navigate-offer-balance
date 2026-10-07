/**
 * Offer Balance — shared domain types.
 * Mirrors ENGINE SPEC — LOCKED v1.0 (§1). No logic lives here.
 */

export type GamePhase = 'intro' | 'building' | 'revealing' | 'debrief' | 'summary';

export type EarnestTier = 'low' | 'mid' | 'high'; // 1% / 3% / 5% (display only)
export type InspectionOption = 'full' | 'info' | 'waived';
export type FinancingOption = 'keep' | 'waived'; // the financing PROTECTION
export type Timeline = 'flexible' | 'standard' | 'needTime';

export type OfferTerm = 'price' | 'earnest' | 'inspection' | 'financing' | 'timeline';

export interface Offer {
  pricePct: number; // integer 0..10 (% over list)
  earnest: EarnestTier;
  inspection: InspectionOption;
  financing: FinancingOption;
  timeline: Timeline;
}

/** Invariant: values sum to exactly 1. */
export type SellerWeights = Record<OfferTerm, number>;

export interface Competitor {
  id: string;
  name: string;
  persona: string;
  offer: Offer; // fixed
}

export interface Scenario {
  id: string;
  roundIndex: 0 | 1 | 2;
  homeLabel: string;
  listPrice: number;
  comfortablePrice: number; // MVP: == listPrice
  sellerNote: string;
  sellerWeights: SellerWeights; // hidden until debrief
  sellerTargetTimeline: Timeline;
  competitors: readonly [Competitor, Competitor, Competitor];
}

export interface RiskBreakdown {
  price: number;
  earnest: number;
  inspection: number;
  financing: number;
  timeline: number;
  total: number;
  overextended: boolean; // total > 100
}

export interface AppealContribution {
  term: OfferTerm;
  termScore: number; // 0..100
  weight: number; // 0..1
  contribution: number; // weight * termScore
}

export interface AppealBreakdown {
  contributions: Record<OfferTerm, AppealContribution>;
  total: number; // 0..100
}

export type OutcomeKind =
  | 'strongWin'
  | 'narrowWin'
  | 'acceptedRisky'
  | 'rejectedHealthy'
  | 'rejectedStretched'
  | 'overextended';

export interface Counterfactual {
  term: OfferTerm;
  fromLabel: string;
  toLabel: string;
  appealDelta: number;
  riskDelta: number;
  flipsToWin: boolean;
  message: string;
}

export interface CompetitorAppeal {
  id: string;
  appeal: number;
}

export interface ScoringResult {
  offer: Offer;
  scenarioId: string;
  risk: RiskBreakdown;
  buyerSafety: number; // clamp(100 - risk.total, 0, 100)
  appeal: AppealBreakdown;
  playerAppeal: number; // == appeal.total
  competitorAppeals: CompetitorAppeal[];
  winnerId: string; // 'player' | competitor.id
  won: boolean; // playerAppeal > max(competitorAppeals)
  margin: number; // playerAppeal - max(competitorAppeals)
  outcome: OutcomeKind;
  counterfactual: Counterfactual | null;
}

export interface RoundResult {
  scenarioId: string;
  roundIndex: number;
  outcome: OutcomeKind;
  won: boolean;
  buyerSafety: number;
  sellerAppeal: number;
}

/**
 * The entire stored game state. Only these five fields are persisted; every
 * scoring value (risk, buyerSafety, sellerAppeal, winner, margin, appeal
 * breakdown, counterfactual) is DERIVED from the engine, never stored here.
 * `currentResult` is the one exception — a frozen snapshot of the submitted
 * round's result, used by the reveal and debrief phases.
 */
export interface GameState {
  phase: GamePhase;
  roundIndex: number;
  offer: Offer;
  currentResult: ScoringResult | null;
  roundResults: RoundResult[];
}
