/**
 * OfferBuilder — the five offer controls. Reports patches upward via onChange;
 * it never scores. Field names map 1:1 to the locked engine Offer.
 */

import type { Offer } from '../../state/types';
import {
  EARNEST_OPTIONS,
  FINANCING_OPTIONS,
  INSPECTION_OPTIONS,
  TIMELINE_OPTIONS,
} from '../../screens/building/presentation';
import { ChoiceGroup } from './ChoiceGroup';
import { PriceSlider } from './PriceSlider';

interface OfferBuilderProps {
  offer: Offer;
  listPrice: number;
  onChange: (patch: Partial<Offer>) => void;
}

export function OfferBuilder({ offer, listPrice, onChange }: OfferBuilderProps) {
  return (
    <div className="ob-builder">
      <PriceSlider
        pricePct={offer.pricePct}
        listPrice={listPrice}
        onChange={(pricePct) => onChange({ pricePct })}
      />
      <ChoiceGroup
        legend="Good-faith deposit"
        help="Money you put up front to show you mean it."
        name="earnest"
        value={offer.earnest}
        options={EARNEST_OPTIONS}
        onSelect={(earnest) => onChange({ earnest })}
      />
      <ChoiceGroup
        legend="Home inspection check"
        help="How much you check the home before committing."
        name="inspection"
        value={offer.inspection}
        options={INSPECTION_OPTIONS}
        onSelect={(inspection) => onChange({ inspection })}
      />
      <ChoiceGroup
        legend="Loan safety net"
        help="Your protection if the mortgage doesn’t come through."
        name="financing"
        value={offer.financing}
        options={FINANCING_OPTIONS}
        onSelect={(financing) => onChange({ financing })}
      />
      <ChoiceGroup
        legend="Move-in timing"
        help="When you’d close and move in."
        name="timeline"
        value={offer.timeline}
        options={TIMELINE_OPTIONS}
        onSelect={(timeline) => onChange({ timeline })}
      />
    </div>
  );
}
