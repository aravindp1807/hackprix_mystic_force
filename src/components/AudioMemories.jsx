import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

export default function AudioMemories() {
  const { entries, add, remove } = useDiaryEntries('audio');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const audio = entries.find(e => e.id === selected);
    if (!audio) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="mixed" count={8} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back to audio memories</button>
          
          {audio.photo && <MediaPreview src={audio.photo} alt={audio.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {audio.mood && <span style={{ fontSize: '2rem' }}>{audio.mood}</span>}
                <div>
                  <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{audio.title}</h2>
                  {audio.audioType && <p style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)' }}>"{audio.audioType}"</p>}
                </div>
              </div>
              {audio.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--pink">📅 {new Date(audio.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {audio.audioType && (<><h3 className="detail-view__section-title">🎧 Audio Type</h3><p className="detail-view__text">{audio.audioType}</p></>)}
              {audio.speaker && (<><h3 className="detail-view__section-title">🗣️ Speaker / Artist</h3><p className="detail-view__text">{audio.speaker}</p></>)}
              {audio.occasion && (<><h3 className="detail-view__section-title">🎤 Occasion</h3><p className="detail-view__text">{audio.occasion}</p></>)}
              {audio.description && (<><h3 className="detail-view__section-title">📝 Description</h3><p className="detail-view__text">{audio.description}</p></>)}
              {audio.transcript && (<><h3 className="detail-view__section-title">📜 Transcript</h3><p className="detail-view__text">{audio.transcript}</p></>)}
              {audio.emotions && (<><h3 className="detail-view__section-title">💭 Emotions</h3><p className="detail-view__text">{audio.emotions}</p></>)}
              {audio.duration && (<><h3 className="detail-view__section-title">⏱️ Duration</h3><p className="detail-view__text">{audio.duration}</p></>)}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(audio.id); setSelected(null); }}>🗑️ Delete</button>
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
        <span className="section-header__emoji">🎵</span>
        <h2 className="section-header__title">Audio Memories</h2>
        <p className="section-header__subtitle">voices, songs & sounds that echo in your heart</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          🎵 Add Audio Memory
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🎵</span>
          <h3 className="empty-state__title">No audio memories yet</h3>
          <p className="empty-state__text">Start by adding your first audio memory!</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((audio, i) => (
            <div
              key={audio.id}
              className="entry-card entry-card--audio"
              onClick={() => setSelected(audio.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {audio.mood && <span className="entry-card__mood">{audio.mood}</span>}
              {audio.photo && <MediaPreview src={audio.photo} alt={audio.title} className="entry-card__photo" />}
              <p className="entry-card__date">{audio.date ? new Date(audio.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{audio.title}</h3>
              {audio.audioType && <p style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)', fontSize: '0.95rem' }}>"{audio.audioType}"</p>}
              <p className="entry-card__preview">{audio.description || audio.speaker || ''}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="audio" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
