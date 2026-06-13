import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import { RainEffect } from './FloatingParticles';

export default function SadMemories() {
  const { entries, add, remove } = useDiaryEntries('sad');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const memory = entries.find(e => e.id === selected);
    if (!memory) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <RainEffect intensity={25} />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back</button>
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {memory.mood && <span style={{ fontSize: '2rem' }}>{memory.mood}</span>}
                <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{memory.title}</h2>
              </div>
              {memory.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--lavender">📅 {new Date(memory.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {memory.whatHappened && (<><h3 className="detail-view__section-title">🌧️ What happened</h3><p className="detail-view__text">{memory.whatHappened}</p></>)}
              {memory.whatILearned && (<><h3 className="detail-view__section-title">📚 What I learned</h3><p className="detail-view__text">{memory.whatILearned}</p></>)}
              {memory.howIGrew && (<><h3 className="detail-view__section-title">🌱 How I grew</h3><p className="detail-view__text">{memory.howIGrew}</p></>)}

              {/* Growth visualization */}
              <div style={{ textAlign: 'center', marginTop: 30, fontSize: '2.5rem', animation: 'growBloom 1s ease-out' }}>
                🌱 → 🌿 → 🌸
              </div>
              <p style={{ textAlign: 'center', fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)', fontSize: '1.1rem', marginTop: 8 }}>
                every storm helps us grow stronger
              </p>

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(memory.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <RainEffect intensity={20} />
      
      <div className="section-header">
        <span className="section-header__emoji">🌧️</span>
        <h2 className="section-header__title">Sad Memories</h2>
        <p className="section-header__subtitle">it's okay to feel... this is your safe space 💙</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          📝 Write it Out
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🌈</span>
          <h3 className="empty-state__title">This page is empty</h3>
          <p className="empty-state__text">When the rain comes, write here. It helps. 💙</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((memory, i) => (
            <div
              key={memory.id}
              className="entry-card entry-card--sad"
              onClick={() => setSelected(memory.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {memory.mood && <span className="entry-card__mood">{memory.mood}</span>}
              <p className="entry-card__date">{memory.date ? new Date(memory.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{memory.title}</h3>
              <p className="entry-card__preview">{memory.whatHappened || ''}</p>
              {memory.howIGrew && (
                <div className="entry-card__tags">
                  <span className="sticker-badge sticker-badge--mint">🌱 I grew from this</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="sad" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
