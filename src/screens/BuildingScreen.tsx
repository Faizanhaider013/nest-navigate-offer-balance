/**
 * BuildingScreen — the real BUILDING phase and P0 gameplay.
 * Fully playable without Phaser. Buyer Safety and Seller Appeal are DERIVED
 * from the locked engine (scoreOffer) via useMemo — never stored, never
 * recomputed in components.
 */

import { useMemo } from "react";
import { useGame } from "../app/GameProvider";
import { BuyerSafetyMeter } from "../components/feedback/BuyerSafetyMeter";
import { AppealEstimate } from "../components/feedback/AppealEstimate";
import { OfferBuilder } from "../components/offer/OfferBuilder";
import { Shell } from "../components/layout/Shell";
import { scoreOffer } from "../engine";
import { SCENARIOS } from "../data/scenarios";
import { TOTAL_ROUNDS } from "../state/reducer";
import type { Offer } from "../state/types";
import { RoundHeader } from "./building/RoundHeader";
import { SellerBrief } from "./building/SellerBrief";
import { SubmitBar } from "./building/SubmitBar";
import { buyerSafetyLabel } from "./building/presentation";
import "./building/building.css";

export function BuildingScreen() {
  const { state, dispatch } = useGame();
  const scenario = SCENARIOS[state.roundIndex];

  const result = useMemo(
    () => scoreOffer(state.offer, scenario),
    [state.offer, scenario],
  );

  const updateOffer = (patch: Partial<Offer>) =>
    dispatch({ type: "UPDATE_OFFER", patch });

  return (
    <Shell size="wide">
      <div className="ob-building-screen">
        <RoundHeader
          roundIndex={state.roundIndex}
          total={TOTAL_ROUNDS}
          homeLabel={scenario.homeLabel}
        />
        <SellerBrief
          listPrice={scenario.listPrice}
          sellerNote={scenario.sellerNote}
        />
        <div className="ob-build">
          <div className="ob-build-controls">
            <div className="ob-section-heading">
              <h2>Your offer, your choices</h2>
              <p>Try different terms and watch the balance change.</p>
            </div>
            <a className="ob-review-link" href="#offer-feedback">
              <span>See live feedback ↓</span>
              <span className="mobile-scores">
                You <strong>{result.buyerSafety}</strong>
                <span aria-hidden="true"> / </span> Seller{" "}
                <strong>{Math.round(result.playerAppeal)}</strong>
              </span>
            </a>
            <OfferBuilder
              offer={state.offer}
              listPrice={scenario.listPrice}
              onChange={updateOffer}
            />
          </div>
          <aside
            id="offer-feedback"
            tabIndex={-1}
            className="ob-build-feedback"
            aria-label="How your offer looks"
          >
            <div className="ob-feedback-heading">
              <span className="ob-eyebrow">The balance</span>
              <h2>How your offer looks</h2>
              <p>Two perspectives on the same offer.</p>
            </div>
            <BuyerSafetyMeter
              safety={result.buyerSafety}
              overextended={result.risk.overextended}
            />
            <AppealEstimate appeal={result.playerAppeal} />
            <p className="ob-balance-note">
              An appealing offer should still feel right for you. Keeping
              protections is a valid choice.
            </p>
            <SubmitBar onSubmit={() => dispatch({ type: "SUBMIT_OFFER" })} />
          </aside>
        </div>
        <p
          className="ob-sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Buyer safety: {result.buyerSafety} of 100,{" "}
          {buyerSafetyLabel(result.buyerSafety, result.risk.overextended)}.
          Seller appeal: {Math.round(result.playerAppeal)} of 100.
        </p>
      </div>
    </Shell>
  );
}
