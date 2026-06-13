import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';

export default function Philosophy() {
  const { entries, add, remove } = useDiaryEntries('philosophy');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Personal Code', 'Observation', 'Deep Thought', 'Life Principle', 'Inner Peace'];
  const filtered = filter === 'All' ? entries : entries.filter(e => e.category === filter);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const thought = entries.find(e => e.id === selected);
    if (!thought) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="dreamy" count={10} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back</button>
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {thought.mood && <span style={{ fontSize: '2rem' }}>{thought.mood}</span>}
                <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{thought.title}</h2>
              </div>
              <div className="detail-view__meta">
                {thought.category && <span className="sticker-badge sticker-badge--lavender">🏷️ {thought.category}</span>}
                {thought.date && <span className="sticker-badge sticker-badge--mint">📅 {new Date(thought.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
              </div>
              
              {thought.quote && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--lavender-light), var(--cream))',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  fontFamily: 'var(--font-script)',
                  fontSize: '1.8rem',
                  color: 'var(--text-dark)',
                  textAlign: 'center',
                  margin: '24px 0',
                  boxShadow: '0 4px 15px var(--shadow-soft)'
                }}>
                  "{thought.quote}"
                </div>
              )}

              {thought.situation && (<><h3 className="detail-view__section-title">🌌 Context</h3><p className="detail-view__text">{thought.situation}</p></>)}
              {thought.experience && (<><h3 className="detail-view__section-title">📖 Experience</h3><p className="detail-view__text">{thought.experience}</p></>)}
              {thought.takeaway && (<><h3 className="detail-view__section-title">💡 Takeaway</h3><p className="detail-view__text">{thought.takeaway}</p></>)}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(thought.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="dreamy" count={12} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">📜</span>
        <h2 className="section-header__title">My Philosophy</h2>
        <p className="section-header__subtitle">inner wisdom, principles, and late-night thoughts...</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          ✒️ Write a Thought
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap', padding: '0 16px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn btn--small ${filter === cat ? 'btn--primary' : 'btn--secondary'}`}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🌌</span>
          <h3 className="empty-state__title">No thoughts yet</h3>
          <p className="empty-state__text">Write down the principles you live by and your inner reflections.</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {filtered.map((thought, i) => (
            <div
              key={thought.id}
              className="entry-card entry-card--philosophy"
              onClick={() => setSelected(thought.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <p className="entry-card__date">{thought.date ? new Date(thought.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">📜 {thought.title}</h3>
              {thought.quote && (
                <p style={{
                  fontFamily: 'var(--font-script)',
                  fontSize: '1.2rem',
                  color: 'var(--text-dark)',
                  margin: '8px 0',
                  fontStyle: 'italic'
                }}>"{thought.quote}"</p>
              )}
              {thought.category && (
                <div className="entry-card__tags">
                  <span className="sticker-badge sticker-badge--lavender">🏷️ {thought.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="philosophy" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
