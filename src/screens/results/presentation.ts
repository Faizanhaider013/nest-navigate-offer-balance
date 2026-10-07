import type { OfferTerm, OutcomeKind } from "../../state/types";

/** Copy and visual tone only. Classification is exclusively owned by the engine. */
export const OUTCOME_PRESENTATION: Record<
  OutcomeKind,
  { title: string; message: string; tone: string; symbol: string }
> = {
  strongWin: {
    title: "A home and a healthy balance.",
    message:
      "Your offer stood out while keeping your comfort in a healthy place. That is a win worth feeling good about.",
    tone: "positive",
    symbol: "✓",
  },
  narrowWin: {
    title: "A win, with room to reflect.",
    message:
      "Your terms appealed to the seller. Take a moment to check your own comfort alongside that acceptance.",
    tone: "positive",
    symbol: "✓",
  },
  acceptedRisky: {
    title: "They said yes. Check in with you.",
    message:
      "The seller chose your offer, but your terms stretched your comfort. An accepted offer can still carry real trade-offs.",
    tone: "caution",
    symbol: "!",
  },
  rejectedHealthy: {
    title: "You protected what matters.",
    message:
      "This one was not the right deal. The seller chose another offer, and you kept your own comfort intact.",
    tone: "calm",
    symbol: "♡",
  },
  rejectedStretched: {
    title: "A chance to find a better balance.",
    message:
      "Another offer won, even though you stretched your comfort. Look at what this seller valued before giving up more.",
    tone: "reflective",
    symbol: "↗",
  },
  overextended: {
    title: "This offer asks too much of you.",
    message:
      "Your terms went beyond your comfort boundary. Whether the seller says yes or no, your side of the decision matters too.",
    tone: "caution",
    symbol: "!",
  },
};
export const TERM_LABELS: Record<OfferTerm, string> = {
  price: "Price",
  earnest: "Good-faith deposit",
  inspection: "Home inspection",
  financing: "Loan safety net",
  timeline: "Closing timing",
};
export function friendlyTip(message: string): string {
  return message
    .replaceAll("financing contingency", "loan safety net")
    .replaceAll("earnest money", "good-faith deposit");
}
