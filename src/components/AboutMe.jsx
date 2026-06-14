import { useState, useEffect, useCallback, useRef } from 'react';
import { fileToDataURL, getProfile, saveProfile } from '../utils/storage';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';
import './AboutMe.css';

const DEFAULT_TRAITS = [
  'Warm & caring', 'Funny & playful', 'Hardworking', 'Quiet & thoughtful',
  'Stubborn (in a good way)', 'Creative & artistic', 'Spiritual & faithful',
  'Family-first', 'Adventurous', 'Gentle & patient', 'Sharp-minded',
  'Loves to tell stories', 'Loves to cook', 'Music lover'
];

const DEFAULT_VALUES = [
  'Family & loved ones',
  'Faith & spirituality',
  'Dignity & independence',
  'Simple daily joys',
  'Memories & legacy'
];

const CARE_PROTOCOLS = [
  'Remind me of good things when I feel low',
  'Help me remember the people I love',
  'Celebrate my important dates with me',
  'Keep my bucket list alive',
  'Speak to me gently and with patience',
  'Share my story with the people who care for me',
  'Never make me feel lost or confused in this diary'
];

export default function AboutMe() {
  const [openSections, setOpenSections] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const [profile, setProfile] = useState(() => {
    const saved = getProfile();
    return saved || {
      identity: {
        name: '',
        dateOfBirth: '',
        hometown: '',
        currentLocation: '',
        motherTongue: '',
        lifesWork: '',
      },
      personalityBlueprint: {
        coreTraits: [],
        whatCalmsMe: '',
        whatMakesMeHappy: '',
        mostProudOf: '',
      },
      coreValues: [...DEFAULT_VALUES],
      careProtocol: [],
      voiceProfile: {
        selfPortrait: '',
        wantPeopleToKnow: '',
        feelsLikeHome: '',
      },
      photo: null
    };
  });

  const [showToast, setShowToast] = useState(false);
  const saveTimeout = useRef(null);

  // Auto-save logic
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveProfile(profile);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
    return () => clearTimeout(saveTimeout.current);
  }, [profile]);

  const toggleSection = (sectionIndex) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const updateIdentity = (field, value) => {
    setProfile(prev => ({ ...prev, identity: { ...prev.identity, [field]: value } }));
  };

  const updatePersonality = (field, value) => {
    setProfile(prev => ({ ...prev, personalityBlueprint: { ...prev.personalityBlueprint, [field]: value } }));
  };

  const toggleTrait = (trait) => {
    setProfile(prev => {
      const traits = prev.personalityBlueprint.coreTraits;
      const isSelected = traits.includes(trait);
      const newTraits = isSelected ? traits.filter(t => t !== trait) : [...traits, trait];
      return { ...prev, personalityBlueprint: { ...prev.personalityBlueprint, coreTraits: newTraits } };
    });
  };

  const toggleCareProtocol = (protocol) => {
    setProfile(prev => {
      const protocols = prev.careProtocol || [];
      const isSelected = protocols.includes(protocol);
      const newProtocols = isSelected ? protocols.filter(p => p !== protocol) : [...protocols, protocol];
      return { ...prev, careProtocol: newProtocols };
    });
  };

  const updateVoice = (field, value) => {
    setProfile(prev => ({ ...prev, voiceProfile: { ...prev.voiceProfile, [field]: value } }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataURL(file);
      setProfile(prev => ({ ...prev, photo: dataUrl }));
    }
  };

  // Drag and Drop for Core Values
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make it slightly transparent while dragging
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIdx(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    setProfile(prev => {
      const newValues = [...prev.coreValues];
      const draggedItem = newValues[draggedIdx];
      newValues.splice(draggedIdx, 1);
      newValues.splice(index, 0, draggedItem);
      return { ...prev, coreValues: newValues };
    });
    setDraggedIdx(index);
  };

  return (
    <div className="aboutme-page section-page">
      <FloatingParticles type="dreamy" count={15} speed="slow" />
      
      <div className="section-header">
        <span className="section-header__emoji">🪞</span>
        <h2 className="section-header__title">About Me</h2>
        <p className="section-header__subtitle">the heart of your diary</p>
      </div>

      <div className="aboutme-container stagger-children">
        
        {/* SECTION 1: IDENTITY */}
        <div className={`aboutme-card ${openSections[1] ? 'is-open' : ''}`} style={{ animationDelay: '0.1s' }}>
          <button className="aboutme-card__header" onClick={() => toggleSection(1)}>
            <div className="aboutme-card__title">
              <span className="aboutme-card__icon">👤</span>
              <h3>1. Who I Am</h3>
            </div>
            <span className="aboutme-card__chevron">▼</span>
          </button>
          
          <div className="aboutme-card__content-wrapper">
            <div className="aboutme-card__content">
              <div className="aboutme-photo-section">
                <label className="aboutme-photo-upload">
                  {profile.photo ? (
                    <MediaPreview src={profile.photo} alt="Profile" className="aboutme-photo-preview" />
                  ) : (
                    <div className="aboutme-photo-placeholder">
                      <span>📸</span>
                      <small>Add Media</small>
                    </div>
                  )}
                  <input type="file" accept="image/*,video/*,audio/*" hidden onChange={handlePhoto} />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Name / What I like to be called</label>
                <input className="diary-input" value={profile.identity.name} onChange={e => updateIdentity('name', e.target.value)} placeholder="Your name..." />
              </div>
              <div className="form-group">
                <label className="form-label">Date of birth</label>
                <input className="diary-input" type="date" value={profile.identity.dateOfBirth} onChange={e => updateIdentity('dateOfBirth', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Where I grew up</label>
                <input className="diary-input" value={profile.identity.hometown} onChange={e => updateIdentity('hometown', e.target.value)} placeholder="Hometown..." />
              </div>
              <div className="form-group">
                <label className="form-label">Where I live now</label>
                <input className="diary-input" value={profile.identity.currentLocation} onChange={e => updateIdentity('currentLocation', e.target.value)} placeholder="Current location..." />
              </div>
              <div className="form-group">
                <label className="form-label">Mother tongue / Language I feel most at home in</label>
                <input className="diary-input" value={profile.identity.motherTongue} onChange={e => updateIdentity('motherTongue', e.target.value)} placeholder="Your language..." />
              </div>
              <div className="form-group">
                <label className="form-label">Occupation or life's work</label>
                <input className="diary-input" value={profile.identity.lifesWork} onChange={e => updateIdentity('lifesWork', e.target.value)} placeholder="What did/do you do?" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PERSONALITY */}
        <div className={`aboutme-card ${openSections[2] ? 'is-open' : ''}`} style={{ animationDelay: '0.2s' }}>
          <button className="aboutme-card__header" onClick={() => toggleSection(2)}>
            <div className="aboutme-card__title">
              <span className="aboutme-card__icon">🧠</span>
              <h3>2. My Personality & Character</h3>
            </div>
            <span className="aboutme-card__chevron">▼</span>
          </button>
          
          <div className="aboutme-card__content-wrapper">
            <div className="aboutme-card__content">
              <div className="form-group">
                <label className="form-label">Personality Traits</label>
                <div className="aboutme-chips">
                  {DEFAULT_TRAITS.map(trait => (
                    <button
                      key={trait}
                      className={`aboutme-chip ${(profile.personalityBlueprint.coreTraits || []).includes(trait) ? 'active' : ''}`}
                      onClick={() => toggleTrait(trait)}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">What calms me when I feel anxious or upset</label>
                <textarea className="diary-textarea" rows="2" value={profile.personalityBlueprint.whatCalmsMe} onChange={e => updatePersonality('whatCalmsMe', e.target.value)} placeholder="A cup of tea, listening to music, gardening..." />
              </div>
              <div className="form-group">
                <label className="form-label">What makes me genuinely happy</label>
                <textarea className="diary-textarea" rows="2" value={profile.personalityBlueprint.whatMakesMeHappy} onChange={e => updatePersonality('whatMakesMeHappy', e.target.value)} placeholder="Seeing my grandchildren, a sunny day..." />
              </div>
              <div className="form-group">
                <label className="form-label">What I am most proud of in my life</label>
                <textarea className="diary-textarea" rows="2" value={profile.personalityBlueprint.mostProudOf} onChange={e => updatePersonality('mostProudOf', e.target.value)} placeholder="My family, my career..." />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: VALUES */}
        <div className={`aboutme-card ${openSections[3] ? 'is-open' : ''}`} style={{ animationDelay: '0.3s' }}>
          <button className="aboutme-card__header" onClick={() => toggleSection(3)}>
            <div className="aboutme-card__title">
              <span className="aboutme-card__icon">💎</span>
              <h3>3. My Core Values</h3>
            </div>
            <span className="aboutme-card__chevron">▼</span>
          </button>
          
          <div className="aboutme-card__content-wrapper">
            <div className="aboutme-card__content">
              <p className="aboutme-helper-text">Drag to rank what matters most to you right now.</p>
              <div className="aboutme-sortable-list">
                {(profile.coreValues || DEFAULT_VALUES).map((value, idx) => (
                  <div
                    key={value}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`aboutme-sortable-item ${draggedIdx === idx ? 'dragging' : ''}`}
                  >
                    <span className="aboutme-rank">{idx + 1}</span>
                    <span className="aboutme-value-text">{value}</span>
                    <span className="aboutme-drag-handle">≡</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: CARE PROTOCOL */}
        <div className={`aboutme-card ${openSections[4] ? 'is-open' : ''}`} style={{ animationDelay: '0.4s' }}>
          <button className="aboutme-card__header" onClick={() => toggleSection(4)}>
            <div className="aboutme-card__title">
              <span className="aboutme-card__icon">🫂</span>
              <h3>4. How This Diary Should Care for Me</h3>
            </div>
            <span className="aboutme-card__chevron">▼</span>
          </button>
          
          <div className="aboutme-card__content-wrapper">
            <div className="aboutme-card__content">
              <div className="aboutme-checkbox-group">
                {CARE_PROTOCOLS.map(protocol => {
                  const isChecked = (profile.careProtocol || []).includes(protocol);
                  return (
                    <label key={protocol} className={`aboutme-checkbox-item ${isChecked ? 'checked' : ''}`}>
                      <div className="aboutme-checkbox-box">
                        {isChecked && '✓'}
                      </div>
                      <input type="checkbox" hidden checked={isChecked} onChange={() => toggleCareProtocol(protocol)} />
                      <span>{protocol}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: VOICE */}
        <div className={`aboutme-card ${openSections[5] ? 'is-open' : ''}`} style={{ animationDelay: '0.5s' }}>
          <button className="aboutme-card__header" onClick={() => toggleSection(5)}>
            <div className="aboutme-card__title">
              <span className="aboutme-card__icon">✒️</span>
              <h3>5. In My Own Words</h3>
            </div>
            <span className="aboutme-card__chevron">▼</span>
          </button>
          
          <div className="aboutme-card__content-wrapper">
            <div className="aboutme-card__content">
              <div className="form-group">
                <label className="form-label">If I could tell someone everything important about me in a few sentences...</label>
                <textarea className="diary-textarea" rows="3" value={profile.voiceProfile.selfPortrait} onChange={e => updateVoice('selfPortrait', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Something I want people to always know about me</label>
                <textarea className="diary-textarea" rows="2" value={profile.voiceProfile.wantPeopleToKnow} onChange={e => updateVoice('wantPeopleToKnow', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">The things in life that have always felt like home</label>
                <textarea className="diary-textarea" rows="2" value={profile.voiceProfile.feelsLikeHome} onChange={e => updateVoice('feelsLikeHome', e.target.value)} />
              </div>

              {/* Voice Preview */}
              {(profile.voiceProfile.selfPortrait || profile.voiceProfile.wantPeopleToKnow || profile.voiceProfile.feelsLikeHome) && (
                <div className="aboutme-voice-preview">
                  <h4 className="aboutme-voice-preview-title">A letter from me</h4>
                  <div className="aboutme-voice-preview-text">
                    {profile.voiceProfile.selfPortrait && <p>{profile.voiceProfile.selfPortrait}</p>}
                    {profile.voiceProfile.wantPeopleToKnow && <p>{profile.voiceProfile.wantPeopleToKnow}</p>}
                    {profile.voiceProfile.feelsLikeHome && <p>{profile.voiceProfile.feelsLikeHome}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className={`aboutme-toast ${showToast ? 'show' : ''}`}>
        Profile saved ✨
      </div>
    </div>
  );
}
