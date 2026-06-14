import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

export default function ImportantDates() {
  const { entries, add, remove } = useDiaryEntries('dates');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const dateEntry = entries.find(e => e.id === selected);
    if (!dateEntry) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="celebration" count={12} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back</button>
          
          {dateEntry.photo && <MediaPreview src={dateEntry.photo} alt={dateEntry.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {dateEntry.mood && <span style={{ fontSize: '2rem' }}>{dateEntry.mood}</span>}
                <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{dateEntry.title}</h2>
              </div>
              {dateEntry.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--pink">📅 {new Date(dateEntry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {dateEntry.importance && (<><h3 className="detail-view__section-title">💭 Importance</h3><p className="detail-view__text">{dateEntry.importance}</p></>)}
              {dateEntry.commemorate && (<><h3 className="detail-view__section-title">🎉 How to remember</h3><p className="detail-view__text">{dateEntry.commemorate}</p></>)}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(dateEntry.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="stars" count={15} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">🗓️</span>
        <h2 className="section-header__title">Important Dates</h2>
        <p className="section-header__subtitle">days that changed everything...</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          🗓️ Save a Date
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">📅</span>
          <h3 className="empty-state__title">No dates saved yet</h3>
          <p className="empty-state__text">Add birthdays, anniversaries, and days worth remembering!</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((dateEntry, i) => (
            <div
              key={dateEntry.id}
              className="entry-card entry-card--dates"
              onClick={() => setSelected(dateEntry.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {dateEntry.mood && <span className="entry-card__mood">{dateEntry.mood}</span>}
              {dateEntry.photo && <MediaPreview src={dateEntry.photo} alt={dateEntry.title} className="entry-card__photo" />}
              <p className="entry-card__date">{dateEntry.date ? new Date(dateEntry.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{dateEntry.title}</h3>
              <p className="entry-card__preview">{dateEntry.importance || ''}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="dates" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
