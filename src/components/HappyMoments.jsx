import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

export default function HappyMoments() {
  const { entries, add, remove } = useDiaryEntries('happy');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const moment = entries.find(e => e.id === selected);
    if (!moment) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="celebration" count={16} speed="normal" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back</button>
          
          {moment.photo && <MediaPreview src={moment.photo} alt={moment.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {moment.mood && <span style={{ fontSize: '2rem' }}>{moment.mood}</span>}
                <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{moment.title}</h2>
              </div>
              {moment.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--gold">📅 {new Date(moment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {moment.achievement && (<><h3 className="detail-view__section-title">🏆 The Achievement</h3><p className="detail-view__text">{moment.achievement}</p></>)}
              {moment.milestone && (<><h3 className="detail-view__section-title">🎯 Milestone</h3><p className="detail-view__text">{moment.milestone}</p></>)}
              {moment.proudOf && (<><h3 className="detail-view__section-title">💪 What I'm proud of</h3><p className="detail-view__text">{moment.proudOf}</p></>)}

              {/* Celebration badge */}
              <div style={{
                textAlign: 'center',
                marginTop: 30,
                padding: 20,
                background: 'linear-gradient(135deg, var(--gold-light), var(--peach-light))',
                borderRadius: 'var(--radius-lg)',
                animation: 'bounceIn 0.6s var(--ease-spring)'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: 8 }}>🌟</span>
                <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.3rem', color: 'var(--text-dark)' }}>
                  You're amazing! Keep shining! ✨
                </p>
              </div>

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(moment.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="celebration" count={14} speed="normal" />
      
      <div className="section-header">
        <span className="section-header__emoji">🏆</span>
        <h2 className="section-header__title">Happy Moments</h2>
        <p className="section-header__subtitle">celebrate every little victory! 🎉</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          🌟 Add a Happy Moment
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🎉</span>
          <h3 className="empty-state__title">No moments yet</h3>
          <p className="empty-state__text">Start celebrating your achievements, big and small!</p>
        </div>
      ) : (
        <>
          {/* Achievement timeline */}
          {entries.length > 1 && (
            <div style={{ maxWidth: 600, margin: '0 auto 36px' }}>
              <h3 style={{ fontFamily: 'var(--font-handwritten)', textAlign: 'center', marginBottom: 20, color: 'var(--text-medium)' }}>
                ✨ Your Achievement Timeline
              </h3>
              <div className="timeline">
                {entries.slice(0, 5).map((m, i) => (
                  <div key={m.id} className="timeline-item" style={{ animationDelay: `${i * 0.15}s` }}>
                    <p className="timeline-date">{m.date ? new Date(m.date).toLocaleDateString() : 'Recently'}</p>
                    <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem' }}>
                      {m.mood || '🌟'} {m.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="entries-grid stagger-children">
            {entries.map((moment, i) => (
              <div
                key={moment.id}
                className="entry-card entry-card--happy"
                onClick={() => setSelected(moment.id)}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {moment.mood && <span className="entry-card__mood">{moment.mood}</span>}
                {moment.photo && <MediaPreview src={moment.photo} alt={moment.title} className="entry-card__photo" />}
                <p className="entry-card__date">{moment.date ? new Date(moment.date).toLocaleDateString() : ''}</p>
                <h3 className="entry-card__title">🏆 {moment.title}</h3>
                <p className="entry-card__preview">{moment.achievement || moment.proudOf || ''}</p>
                {moment.milestone && (
                  <div className="entry-card__tags">
                    <span className="sticker-badge sticker-badge--gold">🎯 {moment.milestone}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && <Modal type="happy" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
