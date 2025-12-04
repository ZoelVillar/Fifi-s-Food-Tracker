import { useState } from 'react';
import Home from './views/Home';
import Stats from './views/Stats';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const navigateToStats = () => {
    setCurrentView('stats');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="app">
      {currentView === 'home' ? (
        <Home onNavigateToStats={navigateToStats} />
      ) : (
        <Stats onBack={navigateToHome} />
      )}
    </div>
  );
}

export default App;
