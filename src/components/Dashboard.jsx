import FloatingParticles from './FloatingParticles';
import { getEntries } from '../utils/storage';

const sections = [
  { key: 'aboutme', emoji: '🪞', title: 'About Me', desc: 'The heart of your diary & synthetic memory', cardClass: 'dashboard__card--aboutme' },
  { key: 'studio', emoji: '🧠', title: 'Memory Studio', desc: 'Capture text, photos, videos & audio memories', cardClass: 'dashboard__card--studio' },
  { key: 'friends', emoji: '👭', title: 'Friends Journal', desc: 'Stories of the people who color your world', cardClass: 'dashboard__card--friends' },
  { key: 'places', emoji: '📍', title: 'Places & Memories', desc: 'Every place tells a story close to the heart', cardClass: 'dashboard__card--places' },
  { key: 'relationships', emoji: '❤️', title: 'Relationships', desc: 'Chapters of love, laughter & lessons', cardClass: 'dashboard__card--relationships' },
  { key: 'sad', emoji: '🌧️', title: 'Sad Memories', desc: 'Even rainy days help flowers grow 🌱', cardClass: 'dashboard__card--sad' },
  { key: 'lessons', emoji: '🌱', title: 'Life Lessons', desc: 'Wisdom gathered along the journey', cardClass: 'dashboard__card--lessons' },
  { key: 'happy', emoji: '🏆', title: 'Happy Moments', desc: 'Celebrations, milestones & proud moments', cardClass: 'dashboard__card--happy' },
  { key: 'bucket', emoji: '🌟', title: 'Bucket List', desc: 'Dreams waiting to come true ✨', cardClass: 'dashboard__card--bucket' },
  { key: 'dates', emoji: '🗓️', title: 'Important Dates', desc: 'Days worth remembering and celebrating', cardClass: 'dashboard__card--dates' },
  { key: 'philosophy', emoji: '📜', title: 'Philosophy', desc: 'Your inner wisdom and reflection', cardClass: 'dashboard__card--philosophy' },
  { key: 'audio', emoji: '🎵', title: 'Audio Memories', desc: 'Voices, songs & sounds that echo in your heart', cardClass: 'dashboard__card--audio' },
  { key: 'mothertongue', emoji: '🌍', title: 'Mother Tongue', desc: 'Stories expressed in your native language', cardClass: 'dashboard__card--mothertongue' },
  { key: 'syntheticmind', emoji: '🧠', title: 'Synthetic Mind Chat', desc: 'Chat with your AI representation trained on Obsidian', cardClass: 'dashboard__card--syntheticmind' },
];

export default function Dashboard({ onNavigate, searchQuery, onSearchChange }) {
  const filteredSections = sections;

  return (
    <div className="dashboard">
      <FloatingParticles type="mixed" count={12} speed="slow" />

      <div className="dashboard__header">
        <h1 className="dashboard__title">My Wisdom ✨</h1>
        <p className="dashboard__subtitle">which page shall we turn to today?</p>

        {/* Search bar */}
        <div className="search-bar" style={{ margin: '24px auto 0' }}>
          <span className="search-bar__icon">🔍</span>
          <input
            className="search-bar__input"
            placeholder="Search your memories..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="dashboard__grid stagger-children">
        {filteredSections.map(section => {
          const count = getEntries(section.key).length;
          return (
            <div
              key={section.key}
              className={`dashboard__card ${section.cardClass}`}
              onClick={() => onNavigate(section.key)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNavigate(section.key)}
            >
              {count > 0 && (
                <span className="dashboard__card-count">
                  {count} {count === 1 ? 'memory' : 'memories'}
                </span>
              )}
              <span className="dashboard__card-emoji">{section.emoji}</span>
              <h3 className="dashboard__card-title">{section.title}</h3>
              <p className="dashboard__card-desc">{section.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
