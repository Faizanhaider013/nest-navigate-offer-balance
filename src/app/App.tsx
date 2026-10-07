/**
 * App — routes by GameState.phase. The reducer is the source of truth;
 * this component only chooses which screen to show.
 */

import { BuildingScreen } from '../screens/BuildingScreen';
import { DebriefScreen } from '../screens/DebriefScreen';
import { IntroScreen } from '../screens/IntroScreen';
import { RevealScreen } from '../screens/RevealScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { useGame } from './GameProvider';

export function App() {
  const { state } = useGame();

  switch (state.phase) {
    case 'intro':
      return <IntroScreen />;
    case 'building':
      return <BuildingScreen />;
    case 'revealing':
      return <RevealScreen />;
    case 'debrief':
      return <DebriefScreen />;
    case 'summary':
      return <SummaryScreen />;
  }
}
