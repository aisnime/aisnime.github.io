import React, { useState } from 'react';
import PublicLandingPage from './components/PublicLandingPage';
import DeveloperDashboard from './components/DeveloperDashboard';
import MinerDashboard from './components/MinerDashboard';

const App: React.FC = () => {
  // Defaulting to DASHBOARD for easier development/debugging as requested
  const [view, setView] = useState<'LANDING' | 'DASHBOARD' | 'MINER'>('DASHBOARD');

  if (view === 'MINER') {
    return <MinerDashboard onBack={() => setView('DASHBOARD')} />;
  }

  if (view === 'DASHBOARD') {
    return <DeveloperDashboard onOpenMinerDashboard={() => setView('MINER')} />;
  }

  return <PublicLandingPage onEnterConsole={() => setView('DASHBOARD')} />;
};

export default App;