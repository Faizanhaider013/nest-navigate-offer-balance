/**
 * Shell — centered, responsive page frame shared by every screen.
 * Just layout; no game logic. `size="wide"` widens the frame for the
 * two-column Building layout.
 */

import { useEffect, useRef, type ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
  size?: "default" | "wide";
}

export function Shell({ children, size = "default" }: ShellProps) {
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  const containerClass =
    size === "wide" ? "ob-container ob-container-wide" : "ob-container";
  return (
    <div className="ob-page">
      <a className="skip-link" href="#game-content">
        Skip to game
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <span className="brand-name">
            Nest<span>Navigate</span>
            <span className="brand-divider" aria-hidden="true" />
          </span>
          <span className="product-label">Learn &amp; Play</span>
          <span className="header-note">
            A little practice. More confidence.
          </span>
        </div>
      </header>
      <main
        id="game-content"
        tabIndex={-1}
        ref={mainRef}
        className={containerClass}
      >
        {children}
      </main>
      <footer className="site-footer">
        <span>Offer Balance</span>
        <span>A practice space for your first home.</span>
      </footer>
    </div>
  );
}
