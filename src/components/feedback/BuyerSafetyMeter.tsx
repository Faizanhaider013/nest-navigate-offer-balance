/**
 * BuyerSafetyMeter — shows the engine's buyerSafety value and its qualitative
 * band. The label is text (not color-only) and "Overextended" is distinct.
 * All values come from the engine; nothing is recomputed here.
 */

import {
  buyerSafetyLabel,
  buyerSafetyTone,
} from "../../screens/building/presentation";

interface BuyerSafetyMeterProps {
  safety: number;
  overextended: boolean;
}

export function BuyerSafetyMeter({
  safety,
  overextended,
}: BuyerSafetyMeterProps) {
  const label = buyerSafetyLabel(safety, overextended);
  const tone = buyerSafetyTone(safety, overextended);

  return (
    <div className="ob-meter ob-buyer-meter" data-overextended={overextended}>
      <span className="ob-perspective">♡ Your side</span>
      <div className="ob-meter-head">
        <h3 className="ob-meter-name">Your comfort</h3>
        <span className="ob-meter-badge" data-tone={tone}>
          {label}
        </span>
      </div>
      <p className="meter-number" aria-hidden="true" key={safety}>
        {safety}
        <span> / 100</span>
      </p>
      <div
        className="ob-meter-track"
        role="meter"
        aria-label="Buyer safety"
        aria-valuenow={safety}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${safety} of 100 — ${label}`}
      >
        <div
          className="ob-meter-fill"
          data-tone={tone}
          style={{ width: `${safety}%` }}
        />
      </div>
      <p className="ob-meter-note">
        Buyer Safety · How comfortable this offer is for you.
      </p>
      {overextended && (
        <p className="ob-caution">
          Beyond your comfort boundary. Try a lower price or keep more
          protections as you explore.
        </p>
      )}
    </div>
  );
}
