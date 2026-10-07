import { formatCurrency } from "./presentation";
import { HomeScene } from "../../components/visual/HomeScene";

interface SellerBriefProps {
  listPrice: number;
  sellerNote: string;
}

export function SellerBrief({ listPrice, sellerNote }: SellerBriefProps) {
  return (
    <section className="ob-brief" aria-label="About this home">
      <HomeScene compact />
      <div className="ob-brief-row">
        <span className="ob-brief-key">List price</span>
        <span className="ob-brief-val">{formatCurrency(listPrice)}</span>
      </div>
      <div className="ob-brief-note">
        <h2 className="ob-brief-note-label">What this seller cares about</h2>
        <p className="ob-brief-note-text">{sellerNote}</p>
      </div>
    </section>
  );
}
