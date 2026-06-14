import { useState } from 'react';
import { useDiaryEntries } from '../hooks/useDiaryEntries';
import Modal from './Modal';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

export default function FriendsJournal() {
  const { entries, add, remove } = useDiaryEntries('friends');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSave = (data) => {
    add(data);
    setShowModal(false);
  };

  if (selected) {
    const friend = entries.find(e => e.id === selected);
    if (!friend) { setSelected(null); return null; }
    return (
      <div className="section-page">
        <FloatingParticles type="hearts" count={10} speed="slow" />
        <div className="detail-view">
          <button className="detail-view__back" onClick={() => setSelected(null)}>← Back to friends</button>
          
          {friend.photo && <MediaPreview src={friend.photo} alt={friend.title} className="detail-view__photo" />}
          
          <div className="diary-page" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="detail-view__meta">
                {friend.mood && <span style={{ fontSize: '2rem' }}>{friend.mood}</span>}
                <div>
                  <h2 style={{ fontFamily: 'var(--font-script)', fontSize: '2.2rem' }}>{friend.title}</h2>
                  {friend.nickname && <p style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)' }}>aka "{friend.nickname}"</p>}
                </div>
              </div>
              {friend.date && <p className="detail-view__meta"><span className="sticker-badge sticker-badge--pink">📅 {new Date(friend.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>}
              
              {friend.firstMeeting && (<><h3 className="detail-view__section-title">🌟 How we met</h3><p className="detail-view__text">{friend.firstMeeting}</p></>)}
              {friend.personality && (<><h3 className="detail-view__section-title">✨ Their personality</h3><p className="detail-view__text">{friend.personality}</p></>)}
              {friend.likes && (<><h3 className="detail-view__section-title">💕 Things I love about them</h3><p className="detail-view__text">{friend.likes}</p></>)}
              {friend.memories && (<><h3 className="detail-view__section-title">📸 Favorite memories</h3><p className="detail-view__text">{friend.memories}</p></>)}
              {friend.funnyMoments && (<><h3 className="detail-view__section-title">😂 Funny moments</h3><p className="detail-view__text">{friend.funnyMoments}</p></>)}
              {friend.lessons && (<><h3 className="detail-view__section-title">🌱 Lessons from them</h3><p className="detail-view__text">{friend.lessons}</p></>)}

              <div className="detail-view__actions">
                <button className="btn btn--secondary btn--small" onClick={() => { remove(friend.id); setSelected(null); }}>🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-page">
      <FloatingParticles type="hearts" count={10} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">👭</span>
        <h2 className="section-header__title">Friends Journal</h2>
        <p className="section-header__subtitle">the people who make life beautiful</p>
      </div>

      <div className="section-actions">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          💝 Add a Friend
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__emoji">👭</span>
          <h3 className="empty-state__title">No friends added yet</h3>
          <p className="empty-state__text">Start by adding your first special friend to your journal!</p>
        </div>
      ) : (
        <div className="entries-grid stagger-children">
          {entries.map((friend, i) => (
            <div
              key={friend.id}
              className="entry-card entry-card--friends"
              onClick={() => setSelected(friend.id)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {friend.mood && <span className="entry-card__mood">{friend.mood}</span>}
              {friend.photo && <MediaPreview src={friend.photo} alt={friend.title} className="entry-card__photo" />}
              <p className="entry-card__date">{friend.date ? new Date(friend.date).toLocaleDateString() : ''}</p>
              <h3 className="entry-card__title">{friend.title}</h3>
              {friend.nickname && <p style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--text-light)', fontSize: '0.95rem' }}>"{friend.nickname}"</p>}
              <p className="entry-card__preview">{friend.firstMeeting || friend.memories || ''}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && <Modal type="friends" onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}
