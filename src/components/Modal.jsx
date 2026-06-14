import { useState } from 'react';
import { fileToDataURL, getProfile } from '../utils/storage';
import MediaPreview from './MediaPreview';
import { translateText, isLanguageSupported } from '../services/sarvam';

const MOODS = ['😊', '🥰', '😢', '😤', '🤔', '😴', '🥺', '😎', '🤗', '💪', '🌟', '🎉'];

export default function Modal({ type, onSave, onClose, initial }) {
  const configs = getFormConfig(type);
  const [form, setForm] = useState(initial || getDefaults(type));
  const [photoPreview, setPhotoPreview] = useState(initial?.photo || null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTranslate = async () => {
    const profile = getProfile();
    const motherTongue = profile?.identity?.motherTongue;
    
    if (!motherTongue || !isLanguageSupported(motherTongue)) {
      setTranslationError(`Language "${motherTongue || 'Unknown'}" is not supported or missing in About Me.`);
      return;
    }
    
    if (!form.nativeMemory) return;

    setTranslating(true);
    setTranslationError('');
    try {
      const translated = await translateText(form.nativeMemory, motherTongue);
      setForm(prev => ({ ...prev, englishTranslation: translated }));
    } catch (err) {
      setTranslationError('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = URL.createObjectURL(file);
      setPhotoPreview(dataUrl);
      setForm(prev => ({ ...prev, photo: dataUrl, rawFile: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2 style={{ fontFamily: 'var(--font-script)', textAlign: 'center', marginBottom: 6 }}>
          {configs.emoji} {initial ? 'Edit' : 'New'} {configs.label}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: 24, fontSize: '0.9rem' }}>
          {configs.subtitle}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Photo upload */}
          {configs.hasPhoto && (
            <div className="form-group">
              <label className="form-label">📸 Media</label>
              <label className="photo-upload" style={{ maxWidth: 200, margin: '0 auto', display: 'flex' }}>
                {photoPreview ? (
                  <MediaPreview src={photoPreview} className="photo-upload__preview" />
                ) : (
                  <>
                    <span className="photo-upload__icon">📷</span>
                    <span className="photo-upload__text">Add media</span>
                  </>
                )}
                <input type="file" accept="image/*,video/*,audio/*" hidden onChange={handlePhoto} />
              </label>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label">{configs.titleLabel || '✏️ Title'}</label>
            <input
              className="diary-input"
              value={form.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              placeholder={configs.titlePlaceholder || 'Give it a name...'}
              required
            />
          </div>

          {/* Dynamic fields */}
          {configs.fields.map(field => (
            <div className="form-group" key={field.key}>
              <label className="form-label">{field.label}</label>
              {field.type === 'textarea' ? (
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="diary-textarea"
                    rows={field.rows || 3}
                    value={form[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                  {field.key === 'nativeMemory' && type === 'mothertongue' && (
                    <div style={{ marginTop: 8 }}>
                      <button 
                        type="button" 
                        className="btn btn--secondary btn--small" 
                        onClick={handleTranslate}
                        disabled={translating || !form.nativeMemory}
                      >
                        {translating ? '⏳ Translating...' : '🔤 Translate to English'}
                      </button>
                      {translationError && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: 4 }}>{translationError}</p>}
                    </div>
                  )}
                </div>
              ) : field.type === 'select' ? (
                <select
                  className="diary-input"
                  value={form[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                >
                  <option value="">{field.placeholder}</option>
                  {field.options.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="diary-input"
                  type={field.type || 'text'}
                  value={form[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {/* Mood picker */}
          {configs.hasMood && (
            <div className="form-group">
              <label className="form-label">🎭 How did it feel?</label>
              <div className="mood-picker">
                {MOODS.map(m => (
                  <button
                    type="button"
                    key={m}
                    className={`mood-emoji ${form.mood === m ? 'active' : ''}`}
                    onClick={() => handleChange('mood', m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          {configs.hasDate && (
            <div className="form-group">
              <label className="form-label">📅 Date</label>
              <input
                className="diary-input"
                type="date"
                value={form.date || ''}
                onChange={e => handleChange('date', e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn--secondary btn--small" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary btn--small">
              {initial ? '✏️ Update' : '✨ Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getDefaults(type) {
  const base = { title: '', mood: '😊', date: new Date().toISOString().split('T')[0] };
  switch(type) {
    case 'friends':
      return { ...base, nickname: '', firstMeeting: '', personality: '', likes: '', memories: '', funnyMoments: '', lessons: '' };
    case 'places':
      return { ...base, location: '', story: '', emotions: '', specialMoments: '' };
    case 'relationships':
      return { ...base, howWeMet: '', memories: '', lessons: '', feelings: '' };
    case 'sad':
      return { ...base, mood: '🥺', whatHappened: '', whatILearned: '', howIGrew: '' };
    case 'lessons':
      return { ...base, source: '', lesson: '', realization: '', category: '' };
    case 'happy':
      return { ...base, mood: '🎉', achievement: '', milestone: '', proudOf: '' };
    case 'bucket':
      return { ...base, mood: '🌟', category: '', description: '', completed: false };
    case 'dates':
      return { ...base, mood: '🗓️', importance: '', commemorate: '' };
    case 'philosophy':
      return { ...base, mood: '📜', quote: '', situation: '', experience: '', takeaway: '', category: '' };
    case 'audio':
      return { ...base, mood: '🎵', description: '', audioType: '', speaker: '', occasion: '', transcript: '', emotions: '', duration: '' };
    case 'mothertongue':
      return { ...base, mood: '🌍', nativeMemory: '', englishTranslation: '' };
    default:
      return base;
  }
}

function getFormConfig(type) {
  switch(type) {
    case 'friends':
      return {
        emoji: '👭', label: 'Friend', subtitle: 'Tell me about someone special...',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '💝 Friend\'s Name',
        titlePlaceholder: 'What\'s their name?',
        fields: [
          { key: 'nickname', label: '🏷️ Nickname', placeholder: 'What do you call them?' },
          { key: 'firstMeeting', label: '🌟 How did you meet?', type: 'textarea', rows: 2, placeholder: 'Tell the story of how you first met...' },
          { key: 'personality', label: '✨ Their personality', type: 'textarea', rows: 2, placeholder: 'What are they like? Their habits, quirks...' },
          { key: 'likes', label: '💕 Things I love about them', type: 'textarea', rows: 2, placeholder: 'What makes them special to you?' },
          { key: 'memories', label: '📸 Favorite memories', type: 'textarea', rows: 3, placeholder: 'Your best memories together...' },
          { key: 'funnyMoments', label: '😂 Funny moments', type: 'textarea', rows: 2, placeholder: 'Times you laughed together...' },
          { key: 'lessons', label: '🌱 Lessons from them', type: 'textarea', rows: 2, placeholder: 'What have they taught you?' },
        ]
      };
    case 'places':
      return {
        emoji: '📍', label: 'Place', subtitle: 'A place that holds memories...',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '📍 Place Name',
        titlePlaceholder: 'What is this place called?',
        fields: [
          { key: 'location', label: '🗺️ Location', placeholder: 'City, Country or just a description...' },
          { key: 'story', label: '📖 The Story', type: 'textarea', rows: 3, placeholder: 'What happened here? Why is it special?' },
          { key: 'emotions', label: '💭 Emotions & Feelings', type: 'textarea', rows: 2, placeholder: 'How did this place make you feel?' },
          { key: 'specialMoments', label: '✨ Special Moments', type: 'textarea', rows: 3, placeholder: 'The moments you\'ll never forget...' },
        ]
      };
    case 'relationships':
      return {
        emoji: '❤️', label: 'Memory', subtitle: 'A chapter of the heart...',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '💝 Title',
        titlePlaceholder: 'A name for this chapter...',
        fields: [
          { key: 'howWeMet', label: '🌹 How we met', type: 'textarea', rows: 3, placeholder: 'The beginning of the story...' },
          { key: 'memories', label: '💕 Beautiful memories', type: 'textarea', rows: 3, placeholder: 'The moments that made your heart smile...' },
          { key: 'lessons', label: '🌱 Things I learned', type: 'textarea', rows: 2, placeholder: 'What this relationship taught you...' },
          { key: 'feelings', label: '💭 Special feelings', type: 'textarea', rows: 2, placeholder: 'The emotions and feelings...' },
        ]
      };
    case 'sad':
      return {
        emoji: '🌧️', label: 'Memory', subtitle: 'Even rainy days help us grow...',
        hasPhoto: false, hasMood: true, hasDate: true,
        titleLabel: '📝 Title',
        titlePlaceholder: 'Name this chapter...',
        fields: [
          { key: 'whatHappened', label: '🌧️ What happened', type: 'textarea', rows: 3, placeholder: 'Tell your story... it\'s safe here.' },
          { key: 'whatILearned', label: '📚 What I learned', type: 'textarea', rows: 3, placeholder: 'Every storm teaches us something...' },
          { key: 'howIGrew', label: '🌱 How I grew', type: 'textarea', rows: 3, placeholder: 'How did this experience change you?' },
        ]
      };
    case 'lessons':
      return {
        emoji: '🌱', label: 'Lesson', subtitle: 'Wisdom from the journey...',
        hasPhoto: false, hasMood: false, hasDate: true,
        titleLabel: '💡 Lesson title',
        titlePlaceholder: 'What did you learn?',
        fields: [
          { key: 'source', label: '👤 From whom / what', placeholder: 'A person, book, experience...' },
          { key: 'lesson', label: '📖 The lesson', type: 'textarea', rows: 3, placeholder: 'Describe what you learned...' },
          { key: 'realization', label: '💫 Key realization', type: 'textarea', rows: 2, placeholder: 'The aha moment...' },
          { key: 'category', label: '🏷️ Category', type: 'select', placeholder: 'Choose a category',
            options: ['From People', 'From Experiences', 'Personal Growth', 'Life Wisdom', 'Career', 'Creativity', 'Self-Love'] },
        ]
      };
    case 'happy':
      return {
        emoji: '🏆', label: 'Moment', subtitle: 'Celebrating your journey! 🎉',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '🌟 What happened?',
        titlePlaceholder: 'Name this happy moment...',
        fields: [
          { key: 'achievement', label: '🏆 The Achievement', type: 'textarea', rows: 3, placeholder: 'What did you achieve? What made you happy?' },
          { key: 'milestone', label: '🎯 Milestone', placeholder: 'Was this a milestone? What kind?' },
          { key: 'proudOf', label: '💪 What I\'m proud of', type: 'textarea', rows: 2, placeholder: 'What makes this moment special...' },
        ]
      };
    case 'bucket':
      return {
        emoji: '🌟', label: 'Dream', subtitle: 'Dream big, start small ✨',
        hasPhoto: false, hasMood: false, hasDate: false,
        titleLabel: '🌟 The Dream',
        titlePlaceholder: 'What do you want to do / experience?',
        fields: [
          { key: 'description', label: '📝 Description', type: 'textarea', rows: 2, placeholder: 'Tell me more about this dream...' },
          { key: 'category', label: '🏷️ Category', type: 'select', placeholder: 'Choose a category',
            options: ['Travel', 'Experience', 'Personal', 'Creative', 'Career', 'Adventure', 'Learning', 'Relationships'] },
        ]
      };
    case 'dates':
      return {
        emoji: '🗓️', label: 'Important Date', subtitle: 'Days worth remembering...',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '🗓️ Event Name',
        titlePlaceholder: 'What is this day called?',
        fields: [
          { key: 'importance', label: '💭 Importance', type: 'textarea', rows: 3, placeholder: 'Why is this date so important to you?' },
          { key: 'commemorate', label: '🎉 How to celebrate / remember', type: 'textarea', rows: 2, placeholder: 'Any traditions or ways you want to mark this day?' },
        ]
      };
    case 'philosophy':
      return {
        emoji: '📜', label: 'Philosophy', subtitle: 'Your inner wisdom and reflection...',
        hasPhoto: false, hasMood: true, hasDate: true,
        titleLabel: '✒️ Title / Topic',
        titlePlaceholder: 'Name this thought...',
        fields: [
          { key: 'quote', label: '📜 Your Quote / Core Thought', type: 'textarea', rows: 2, placeholder: '"Write your own philosophy here..."' },
          { key: 'situation', label: '🌌 Situation / Context', type: 'textarea', rows: 2, placeholder: 'What inspired this? A particular situation?' },
          { key: 'experience', label: '📖 Experience', type: 'textarea', rows: 3, placeholder: 'Share your personal experience related to this...' },
          { key: 'takeaway', label: '💡 Takeaway', type: 'textarea', rows: 2, placeholder: 'The main lesson or reflection from this...' },
          { key: 'category', label: '🏷️ Category', type: 'select', placeholder: 'Choose a category',
            options: ['Personal Code', 'Observation', 'Deep Thought', 'Life Principle', 'Inner Peace'] },
        ]
      };
    case 'audio':
      return {
        emoji: '🎵', label: 'Audio Memory', subtitle: 'A voice, song or sound worth remembering...',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '🎵 Audio Title',
        titlePlaceholder: 'Name this audio memory...',
        fields: [
          { key: 'audioType', label: '🎧 Audio Type', type: 'select', placeholder: 'Choose audio type',
            options: ['Voice Note', 'Music', 'Song', 'Interview', 'Speech', 'Podcast', 'Sound', 'Other'] },
          { key: 'speaker', label: '🗣️ Speaker / Artist', placeholder: 'Who is speaking or performing?' },
          { key: 'occasion', label: '🎤 Occasion', placeholder: 'When or why was this recorded?' },
          { key: 'description', label: '📝 Description', type: 'textarea', rows: 3, placeholder: 'Describe this audio memory...' },
          { key: 'transcript', label: '📜 Transcript', type: 'textarea', rows: 3, placeholder: 'Optional transcript of the audio...' },
          { key: 'emotions', label: '💭 Emotions & Feelings', type: 'textarea', rows: 2, placeholder: 'How does this audio make you feel?' },
          { key: 'duration', label: '⏱️ Duration', placeholder: 'e.g. 2:30, 5 minutes...' },
        ]
      };
    case 'mothertongue':
      return {
        emoji: '🌍', label: 'Native Memory', subtitle: 'A story from the heart, in your own words...',
        hasPhoto: true, hasMood: true, hasDate: true,
        titleLabel: '✨ Title',
        titlePlaceholder: 'Name this memory...',
        fields: [
          { key: 'nativeMemory', label: '🌐 Memory in Native Language', type: 'textarea', rows: 4, placeholder: 'Write your memory here...' },
          { key: 'englishTranslation', label: '📝 English Translation', type: 'textarea', rows: 4, placeholder: 'Translation will appear here...' },
        ]
      };
    default:
      return { emoji: '📝', label: 'Entry', subtitle: '', hasPhoto: false, hasMood: true, hasDate: true, fields: [] };
  }
}
