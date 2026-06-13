import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';

export default function BucketList() {
  const { entries, add, update, remove } = useDiaryEntries('bucket');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  const toggleComplete = (id, current) => {
    update(id, { completed: !current });
  };

  const filtered = filter === 'all' ? entries 
    : filter === 'active' ? entries.filter(e => !e.completed)
    : entries.filter(e => e.completed);

  const completedCount = entries.filter(e => e.completed).length;
  const totalCount = entries.length;
  const progress = totalCount > 0 ? (completedCount / totalCount * 100) : 0;

  return (
    <div className="section-page">
      <FloatingParticles type="dreamy" count={12} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">🌟</span>
        <h2 className="section-header__title">Bucket List</h2>
        <p className="section-header__subtitle">dreams waiting to come true ✨</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          ✨ Add a Dream
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div style={{ maxWidth: 500, margin: '0 auto 28px', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--text-medium)' }}>
              {completedCount} of {totalCount} dreams achieved
            </span>
            <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--pink-dark)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 14,
            background: 'var(--paper-lines)',
            borderRadius: 10,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--pink), var(--lavender), var(--mint))',
              borderRadius: 10,
              transition: 'width 0.6s var(--ease-spring)',
              position: 'relative'
            }}>
              {progress > 10 && (
                <span style={{
                  position: 'absolute',
                  right: -8,
                  top: -4,
                  fontSize: '1.2rem',
                  animation: 'twinkle 2s ease-in-out infinite'
                }}>⭐</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
        {[
          { key: 'all', label: `All (${totalCount})` },
          { key: 'active', label: `Active (${totalCount - completedCount})` },
          { key: 'completed', label: `Done (${completedCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn btn--small ${filter === tab.key ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">🦋</span>
          <h3 className="empty-state__title">{filter === 'all' ? 'No dreams yet' : filter === 'active' ? 'All dreams achieved! 🎉' : 'No dreams completed yet'}</h3>
          <p className="empty-state__text">What do you dream of doing? Add it here!</p>
        </div>
      ) : (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {filtered.map((item, i) => (
            <div key={item.id} className="bucket-item" style={{ animationDelay: `${i * 0.08}s` }}>
              <button
                className={`bucket-checkbox ${item.completed ? 'checked' : ''}`}
                onClick={() => toggleComplete(item.id, item.completed)}
              >
                {item.completed ? '✓' : ''}
              </button>
              <div className="bucket-item__content">
                <h3 className={`bucket-item__title ${item.completed ? 'completed' : ''}`}>
                  {item.title}
                </h3>
                {item.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-medium)', marginBottom: 4 }}>{item.description}</p>}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {item.category && <span className="sticker-badge sticker-badge--lavender" style={{ fontSize: '0.7rem' }}>🏷️ {item.category}</span>}
                  {item.completed && <span className="sticker-badge sticker-badge--mint" style={{ fontSize: '0.7rem' }}>✨ Achieved!</span>}
                </div>
              </div>
              <button
                className="btn btn--icon btn--secondary"
                style={{ width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}
                onClick={() => remove(item.id)}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="bucket" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
