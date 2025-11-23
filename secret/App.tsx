import React, { useState } from 'react';
import PublicLandingPage from './components/PublicLandingPage';
import DeveloperDashboard from './components/DeveloperDashboard';

const App: React.FC = () => {
  // Defaulting to DASHBOARD for easier development/debugging as requested
  const [view, setView] = useState<'LANDING' | 'DASHBOARD'>('DASHBOARD');

  if (view === 'DASHBOARD') {
    return <DeveloperDashboard />;
  }

  return <PublicLandingPage onEnterConsole={() => setView('DASHBOARD')} />;
};

export default App;