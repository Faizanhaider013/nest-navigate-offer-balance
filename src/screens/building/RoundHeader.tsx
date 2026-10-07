interface RoundHeaderProps {
  roundIndex: number;
  total: number;
  homeLabel: string;
}

export function RoundHeader({
  roundIndex,
  total,
  homeLabel,
}: RoundHeaderProps) {
  return (
    <header className="ob-round">
      <p className="game-breadcrumb">
        Offer Balance <span aria-hidden="true">/</span> Find your balance
      </p>
      <div className="ob-round-progress">
        <p className="ob-eyebrow">
          Home {roundIndex + 1} of {total}
        </p>
        <span className="ob-progress-dots" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={index <= roundIndex ? "is-filled" : ""}
            />
          ))}
        </span>
      </div>
      <h1 className="ob-title">Build your offer</h1>
      <p className="ob-round-home">{homeLabel}</p>
    </header>
  );
}
