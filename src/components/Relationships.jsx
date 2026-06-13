import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';

export default function Relationships() {
  const { entries, add, remove } = useDiaryEntries('relationships');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const rel = entries.find(e => e.id === selected);
    if (!rel) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="hearts" count={14} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back</button>
          
          {rel.photo && <img src={rel.photo} alt={rel.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {rel.mood && <span style={{ fontSize: '2rem' }}>{rel.mood}</span>}
                <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{rel.title}</h2>
              </div>
              {rel.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--pink">📅 {new Date(rel.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {rel.howWeMet && (<><h3 className="detail-view__section-title">🌹 How we met</h3><p className="detail-view__text">{rel.howWeMet}</p></>)}
              {rel.memories && (<><h3 className="detail-view__section-title">💕 Beautiful memories</h3><p className="detail-view__text">{rel.memories}</p></>)}
              {rel.lessons && (<><h3 className="detail-view__section-title">🌱 Things I learned</h3><p className="detail-view__text">{rel.lessons}</p></>)}
              {rel.feelings && (<><h3 className="detail-view__section-title">💭 Special feelings</h3><p className="detail-view__text">{rel.feelings}</p></>)}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(rel.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="hearts" count={14} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">❤️</span>
        <h2 className="section-header__title">Relationships</h2>
        <p className="section-header__subtitle">chapters of the heart, written with love</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          💝 Write a Chapter
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">💌</span>
          <h3 className="empty-state__title">No stories yet</h3>
          <p className="empty-state__text">Write about the relationships that shaped your heart</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((rel, i) => (
            <div
              key={rel.id}
              className="entry-card entry-card--relationships"
              onClick={() => setSelected(rel.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {rel.mood && <span className="entry-card__mood">{rel.mood}</span>}
              {rel.photo && <img src={rel.photo} alt={rel.title} className="entry-card__photo" />}
              <p className="entry-card__date">{rel.date ? new Date(rel.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{rel.title}</h3>
              <p className="entry-card__preview">{rel.howWeMet || rel.memories || ''}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="relationships" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
