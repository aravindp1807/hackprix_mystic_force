export default function Navbar({ currentPage, onNavigate, theme, onToggleTheme }) {
  const showBack = currentPage !== 'landing' && currentPage !== 'dashboard';

  return (
    <nav className="navbar" style={{ display: currentPage === 'landing' ? 'none' : 'flex' }}>
      <div className="navbar__brand" onClick={() => onNavigate('dashboard')}>
        📔 Dear Me
      </div>
      <div className="navbar__actions">
        {showBack && (
          <button className="navbar__back-btn" onClick={() => onNavigate('dashboard')} title="Back to dashboard">
            ←
          </button>
        )}
        <button className="navbar__theme-toggle" onClick={onToggleTheme} title="Toggle dark mode">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
