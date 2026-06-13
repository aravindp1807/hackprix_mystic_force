import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';

export default function LifeLessons() {
  const { entries, add, remove } = useDiaryEntries('lessons');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'From People', 'From Experiences', 'Personal Growth', 'Life Wisdom', 'Career', 'Creativity', 'Self-Love'];
  const filtered = filter === 'All' ? entries : entries.filter(e => e.category === filter);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const lesson = entries.find(e => e.id === selected);
    if (!lesson) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="flowers" count={8} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back</button>
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem', marginBottom: 8 }}>{lesson.title}</h2>
              
              <div className="detail-view__meta">
                {lesson.category && <span className="sticker-badge sticker-badge--mint">🏷️ {lesson.category}</span>}
                {lesson.date && <span className="sticker-badge sticker-badge--lavender">📅 {new Date(lesson.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
              </div>
              
              {lesson.source && (<><h3 className="detail-view__section-title">👤 From</h3><p className="detail-view__text">{lesson.source}</p></>)}
              {lesson.lesson && (<><h3 className="detail-view__section-title">📖 The Lesson</h3><p className="detail-view__text">{lesson.lesson}</p></>)}
              {lesson.realization && (
                <>
                  <h3 className="detail-view__section-title">💫 Key Realization</h3>
                  <div style={{
                    background: 'linear-gradient(135deg, var(--mint-light), var(--lavender-light))',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px 24px',
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '1.3rem',
                    color: 'var(--text-dark)',
                    lineHeight: 1.6,
                    borderLeft: '4px solid var(--mint)',
                    marginTop: 8
                  }}>
                    "{lesson.realization}"
                  </div>
                </>
              )}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(lesson.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="flowers" count={8} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">🌱</span>
        <h2 className="section-header__title">Life Lessons</h2>
        <p className="section-header__subtitle">wisdom gathered along the journey</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          💡 Add a Lesson
        </button>
      </div>

      {/* Category filter */}
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
          <span className="empty-state__emoji">📚</span>
          <h3 className="empty-state__title">{filter === 'All' ? 'No lessons yet' : `No "${filter}" lessons`}</h3>
          <p className="empty-state__text">Every experience teaches us something valuable</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {filtered.map((lesson, i) => (
            <div
              key={lesson.id}
              className="entry-card entry-card--lessons"
              onClick={() => setSelected(lesson.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <p className="entry-card__date">{lesson.date ? new Date(lesson.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">💡 {lesson.title}</h3>
              {lesson.source && <p style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: 6 }}>from: {lesson.source}</p>}
              <p className="entry-card__preview">{lesson.lesson || lesson.realization || ''}</p>
              {lesson.category && (
                <div className="entry-card__tags">
                  <span className="sticker-badge sticker-badge--mint">🏷️ {lesson.category}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="lessons" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
