import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

export default function MotherTongueJournal() {
  const { entries, add, remove } = useDiaryEntries('mothertongue');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const entry = entries.find(e => e.id === selected);
    if (!entry) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="mixed" count={8} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back to journal</button>
          
          {entry.photo && <MediaPreview src={entry.photo} alt={entry.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {entry.mood && <span style={{ fontSize: '2rem' }}>{entry.mood}</span>}
                <div>
                  <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{entry.title}</h2>
                </div>
              </div>
              {entry.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--pink">📅 {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {entry.nativeMemory && (
                <>
                  <h3 className="detail-view__section-title">🌐 Native Memory</h3>
                  <p className="detail-view__text" style={{ whiteSpace: 'pre-wrap' }}>{entry.nativeMemory}</p>
                </>
              )}
              {entry.englishTranslation && (
                <>
                  <h3 className="detail-view__section-title">📝 English Translation</h3>
                  <p className="detail-view__text" style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', color: 'var(--text-medium)' }}>
                    {entry.englishTranslation}
                  </p>
                </>
              )}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(entry.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="mixed" count={8} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">🌍</span>
        <h2 className="section-header__title">Mother Tongue</h2>
        <p className="section-header__subtitle">stories expressed in your native language</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          🌍 Add Native Memory
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🌍</span>
          <h3 className="empty-state__title">No memories yet</h3>
          <p className="empty-state__text">Start by adding a memory in your native language!</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="entry-card entry-card--mothertongue"
              onClick={() => setSelected(entry.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {entry.mood && <span className="entry-card__mood">{entry.mood}</span>}
              {entry.photo && <MediaPreview src={entry.photo} alt={entry.title} className="entry-card__photo" />}
              <p className="entry-card__date">{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{entry.title}</h3>
              <p className="entry-card__preview">{entry.nativeMemory || entry.englishTranslation || ''}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="mothertongue" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
