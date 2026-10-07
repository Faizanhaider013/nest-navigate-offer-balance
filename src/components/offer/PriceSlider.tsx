/**
 * PriceSlider — semantic range input for pricePct (0..10 = % over list).
 * Shows a friendly dollar readout; the engine owns what the number means.
 */

import { formatCurrency } from "../../screens/building/presentation";
import type { CSSProperties } from "react";
import { PRICE_PCT_MIN, PRICE_PCT_MAX } from "../../engine";

interface PriceSliderProps {
  pricePct: number;
  listPrice: number;
  onChange: (pricePct: number) => void;
}

export function PriceSlider({
  pricePct,
  listPrice,
  onChange,
}: PriceSliderProps) {
  const offerPrice = listPrice * (1 + pricePct / 100);
  const valueText =
    pricePct === 0
      ? `At the list price, ${formatCurrency(listPrice)}`
      : `${pricePct}% over list, about ${formatCurrency(offerPrice)}`;

  return (
    <div className="ob-price">
      <label htmlFor="price-range" className="ob-choice-legend">
        Your price
      </label>
      <p id="price-help" className="ob-choice-help">
        List price is {formatCurrency(listPrice)}. How much over asking do you
        want to offer?
      </p>
      <div className="ob-price-readout" aria-hidden="true">
        <span className="ob-price-dollars">{formatCurrency(offerPrice)}</span>
        <span className="ob-price-pct">
          {pricePct === 0 ? "At list price" : `+${pricePct}% over list`}
        </span>
      </div>
      <input
        id="price-range"
        className="ob-range"
        type="range"
        min={PRICE_PCT_MIN}
        max={PRICE_PCT_MAX}
        style={
          {
            "--range-progress": `${((pricePct - PRICE_PCT_MIN) / (PRICE_PCT_MAX - PRICE_PCT_MIN)) * 100}%`,
          } as CSSProperties
        }
        step={1}
        value={pricePct}
        aria-valuetext={valueText}
        aria-describedby="price-help"
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
      <div className="ob-range-endpoints" aria-hidden="true">
        <span>List price</span>
        <span>+{PRICE_PCT_MAX}% over list</span>
      </div>
    </div>
  );
}
