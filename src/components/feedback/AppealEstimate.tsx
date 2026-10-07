/**
 * AppealEstimate — shows the engine's seller-appeal value in friendly terms.
 * Never framed as a guaranteed acceptance; no formulas exposed.
 */

interface AppealEstimateProps {
  appeal: number;
}

export function AppealEstimate({ appeal }: AppealEstimateProps) {
  const value = Math.round(appeal);

  return (
    <div className="ob-meter ob-seller-meter">
      <span className="ob-perspective">⌂ Seller’s side</span>
      <div className="ob-meter-head">
        <h3 className="ob-meter-name">Seller appeal</h3>
      </div>
      <p className="meter-number" aria-hidden="true" key={value}>
        {value}
        <span> / 100</span>
      </p>
      <div
        className="ob-meter-track"
        role="meter"
        aria-label="Seller appeal"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${value} of 100`}
      >
        <div
          className="ob-meter-fill"
          data-tone="appeal"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="ob-meter-note">
        How much this offer may appeal to the seller — not a guarantee.
      </p>
    </div>
  );
}
