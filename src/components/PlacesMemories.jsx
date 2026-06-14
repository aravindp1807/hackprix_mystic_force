import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

export default function PlacesMemories() {
  const { entries, add, remove } = useDiaryEntries('places');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const place = entries.find(e => e.id === selected);
    if (!place) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="flowers" count={10} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back to places</button>
          
          {place.photo && <MediaPreview src={place.photo} alt={place.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {place.mood && <span style={{ fontSize: '2rem' }}>{place.mood}</span>}
                <div>
                  <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{place.title}</h2>
                  {place.location && <p style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)' }}>📍 {place.location}</p>}
                </div>
              </div>
              {place.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--blue">📅 {new Date(place.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {place.story && (<><h3 className="detail-view__section-title">📖 The Story</h3><p className="detail-view__text">{place.story}</p></>)}
              {place.emotions && (<><h3 className="detail-view__section-title">💭 Emotions & Feelings</h3><p className="detail-view__text">{place.emotions}</p></>)}
              {place.specialMoments && (<><h3 className="detail-view__section-title">✨ Special Moments</h3><p className="detail-view__text">{place.specialMoments}</p></>)}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(place.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="flowers" count={10} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">📍</span>
        <h2 className="section-header__title">Places & Memories</h2>
        <p className="section-header__subtitle">every place holds a piece of your heart</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          📍 Add a Place
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🗺️</span>
          <h3 className="empty-state__title">No places yet</h3>
          <p className="empty-state__text">Add the places that hold special memories in your heart</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((place, i) => (
            <div
              key={place.id}
              className="entry-card entry-card--places"
              onClick={() => setSelected(place.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {place.mood && <span className="entry-card__mood">{place.mood}</span>}
              {place.photo && <MediaPreview src={place.photo} alt={place.title} className="entry-card__photo" />}
              <p className="entry-card__date">{place.date ? new Date(place.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{place.title}</h3>
              {place.location && <div className="entry-card__tags"><span className="sticker-badge sticker-badge--blue">📍 {place.location}</span></div>}
              <p className="entry-card__preview">{place.story || ''}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="places" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
