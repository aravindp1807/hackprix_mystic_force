import { useState, useEffect } from 'react';
import './index.css';
import { getSettings, saveSetting } from './utils/storage';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import FriendsJournal from './components/FriendsJournal';
import PlacesMemories from './components/PlacesMemories';
import Relationships from './components/Relationships';
import SadMemories from './components/SadMemories';
import LifeLessons from './components/LifeLessons';
import HappyMoments from './components/HappyMoments';
import BucketList from './components/BucketList';
import ImportantDates from './components/ImportantDates';
import Philosophy from './components/Philosophy';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [theme, setTheme] = useState(() => getSettings().theme || 'light');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveSetting('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onOpen={() => navigate('dashboard')} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
      case 'friends':
        return <FriendsJournal />;
      case 'places':
        return <PlacesMemories />;
      case 'relationships':
        return <Relationships />;
      case 'sad':
        return <SadMemories />;
      case 'lessons':
        return <LifeLessons />;
      case 'happy':
        return <HappyMoments />;
      case 'bucket':
        return <BucketList />;
      case 'dates':
        return <ImportantDates />;
      case 'philosophy':
        return <Philosophy />;
      default:
        return <Dashboard onNavigate={navigate} searchQuery={searchQuery} onSearchChange={setSearchQuery} />;
    }
  };

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main>
        {renderPage()}
      </main>
    </>
  );
}
