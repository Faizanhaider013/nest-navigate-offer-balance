import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { GameProvider } from '../GameProvider';
import { BuildingScreen } from '../../screens/BuildingScreen';
import { DebriefScreen } from '../../screens/DebriefScreen';
import { RevealScreen } from '../../screens/RevealScreen';
import { SummaryScreen } from '../../screens/SummaryScreen';
import type { ReactElement } from 'react';

const renderInGame = (ui: ReactElement) => render(<GameProvider>{ui}</GameProvider>);

describe('Intro screen', () => {
  it('renders the intro with a level-1 heading', () => {
    renderInGame(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Offer Balance' })).toBeInTheDocument();
  });

  it('exposes a clear, keyboard-reachable start CTA', () => {
    renderInGame(<App />);
    const cta = screen.getByRole('button', { name: /start/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('type', 'button');
  });

  it('clicking the CTA dispatches START_GAME and advances to the building placeholder', async () => {
    const user = userEvent.setup();
    renderInGame(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Offer Balance' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /start/i }));

    // intro is gone; building placeholder is shown
    expect(screen.queryByRole('heading', { level: 1, name: 'Offer Balance' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Build your offer' })).toBeInTheDocument();
    expect(screen.getByText(/home 1 of 3/i)).toBeInTheDocument();
  });
});

describe('phase placeholders render', () => {
  it('building', () => {
    renderInGame(<BuildingScreen />);
    expect(screen.getByRole('heading', { name: 'Build your offer' })).toBeInTheDocument();
  });

  it('revealing', () => {
    renderInGame(<RevealScreen />);
    expect(screen.getByRole('heading', { name: 'Seeing how it lands' })).toBeInTheDocument();
  });

  it('debrief', () => {
    renderInGame(<DebriefScreen />);
    expect(screen.getByRole('heading', { name: 'Your result' })).toBeInTheDocument();
  });

  it('summary', () => {
    renderInGame(<SummaryScreen />);
    expect(screen.getByRole('heading', { name: 'How you did' })).toBeInTheDocument();
  });
});
