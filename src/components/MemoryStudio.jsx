import { useState, useRef } from 'react';
import { addEntry, getOrCreatePatientId } from '../utils/storage';
import { uploadMedia, saveMediaItem } from '../services/backend';
import { preparePdfData } from '../services/pdfExport';
import FloatingParticles from './FloatingParticles';
import MediaPreview from './MediaPreview';

const INTAKE_MODES = [
  { key: 'text', icon: '📝', title: 'Text Intake', desc: 'Diary notes and stories' },
  { key: 'photo', icon: '📸', title: 'Photo Intake', desc: 'Faces and emotional images' },
  { key: 'video', icon: '🎬', title: 'Video Intake', desc: 'Scenes and life moments' },
  { key: 'audio', icon: '🎵', title: 'Audio Intake', desc: 'Voices, songs and sounds' },
];

export default function MemoryStudio() {
  const [activeMode, setActiveMode] = useState('text');
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  // Audio-specific fields
  const [audioType, setAudioType] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [occasion, setOccasion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [emotions, setEmotions] = useState('');
  const [duration, setDuration] = useState('');

  const resetForm = () => {
    setTitle('');
    setTextContent('');
    setMediaFile(null);
    setMediaPreview(null);
    setAudioType('');
    setSpeaker('');
    setOccasion('');
    setTranscript('');
    setEmotions('');
    setDuration('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    resetForm();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const getAcceptType = () => {
    switch (activeMode) {
      case 'photo': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      default: return '';
    }
  };

  const doToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);

    try {
      const patientId = getOrCreatePatientId();
      const entryId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

      // Build entry data based on mode
      const entryData = {
        title,
        mood: activeMode === 'audio' ? '🎵' : activeMode === 'video' ? '🎬' : activeMode === 'photo' ? '📸' : '📝',
        date: new Date().toISOString().split('T')[0],
      };

      if (activeMode === 'text') {
        entryData.description = textContent;
      }

      if (activeMode === 'audio') {
        entryData.audioType = audioType;
        entryData.speaker = speaker;
        entryData.occasion = occasion;
        entryData.transcript = transcript;
        entryData.emotions = emotions;
        entryData.duration = duration;
        entryData.description = textContent;
      }

      if (activeMode !== 'text' && activeMode !== 'audio') {
        entryData.description = textContent;
      }

      // If we have a media file, attach it
      if (mediaFile) {
        entryData.rawFile = mediaFile;
        entryData.photo = mediaPreview;
      }

      // Determine which section to save to
      const section = activeMode === 'audio' ? 'audio' : 'happy';

      // Save to localStorage + Supabase via addEntry (handles file upload automatically)
      addEntry(section, entryData);

      // Additionally, upload to scme-media bucket and record in media_items
      if (mediaFile) {
        const safeName = mediaFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${patientId}/studio_${entryId}_${safeName}`;

        uploadMedia('scme-media', path, mediaFile).then(url => {
          if (url) {
            saveMediaItem(null, patientId, {
              mediaType: activeMode,
              filePath: url,
              caption: title,
              analysis: {
                source: 'memory_studio',
                mode: activeMode,
                ...(activeMode === 'audio' ? { audioType, speaker, occasion, emotions, duration } : {}),
              },
            });
          }
        }).catch(err => console.warn('[MemoryStudio] Upload failed:', err));
      }

      doToast(`✨ ${activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} memory saved!`);
      resetForm();
    } catch (err) {
      console.error('[MemoryStudio] Save error:', err);
      doToast('❌ Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreparePdfData = async () => {
    setPreparing(true);
    doToast('⏳ Compiling data and transcribing audio...');
    try {
      await preparePdfData();
      doToast('✅ Data compilation complete and downloaded!');
    } catch (err) {
      console.error('[MemoryStudio] Prepare PDF Data error:', err);
      doToast('❌ Failed to prepare data. Check console.');
    } finally {
      setPreparing(false);
    }
  };

  return (
    <div className="section-page">
      <FloatingParticles type="dreamy" count={10} speed="slow" />

      {/* Header */}
      <div className="studio-header">
        <div className="studio-header__icon">🧠</div>
        <h2 className="studio-header__title">Memory Studio</h2>
        <p className="studio-header__subtitle">
          Save individual memories here. All saved content will be bundled into one PDF and ZIP when you're ready.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn btn--primary" 
            onClick={handlePreparePdfData}
            disabled={preparing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>{preparing ? '⏳ Processing...' : '🗂️ Prepare PDF Data'}</span>
          </button>
        </div>
      </div>

      {/* Intake Mode Cards */}
      <div className="studio-modes">
        {INTAKE_MODES.map(mode => (
          <button
            key={mode.key}
            className={`studio-mode-card ${activeMode === mode.key ? 'studio-mode-card--active' : ''} studio-mode-card--${mode.key}`}
            onClick={() => handleModeChange(mode.key)}
          >
            <span className="studio-mode-card__icon">{mode.icon}</span>
            <h4 className="studio-mode-card__title">{mode.title}</h4>
            <p className="studio-mode-card__desc">{mode.desc}</p>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="studio-form">
        {/* Title */}
        <div className="form-group">
          <label className="form-label">📝 Title</label>
          <input
            className="diary-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give this memory a name..."
          />
        </div>

        {/* Text area */}
        <div className="form-group">
          <label className="form-label">
            {activeMode === 'text' ? '📂 Your memory' : '📝 Description / Notes'}
          </label>
          <textarea
            className="diary-textarea"
            rows={activeMode === 'text' ? 6 : 3}
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
            placeholder={activeMode === 'text' ? 'Write or paste your memory here...' : 'Add a description or notes...'}
          />
        </div>

        {/* Media Upload — for photo, video, audio */}
        {activeMode !== 'text' && (
          <div className="form-group">
            <label className="form-label">
              {activeMode === 'photo' ? '📸 Upload Photo' : activeMode === 'video' ? '🎬 Upload Video' : '🎵 Upload Audio'}
            </label>
            <label className="studio-upload">
              {mediaPreview ? (
                <MediaPreview src={mediaPreview} alt={title} className="studio-upload__preview" />
              ) : (
                <div className="studio-upload__placeholder">
                  <span className="studio-upload__placeholder-icon">
                    {activeMode === 'photo' ? '📷' : activeMode === 'video' ? '🎥' : '🎙️'}
                  </span>
                  <span className="studio-upload__placeholder-text">
                    Click to upload {activeMode}
                  </span>
                  <span className="studio-upload__placeholder-hint">
                    {activeMode === 'photo' ? 'JPG, PNG, WebP' : activeMode === 'video' ? 'MP4, WebM, MOV' : 'MP3, WAV, M4A, OGG'}
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptType()}
                hidden
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {/* Audio-specific fields */}
        {activeMode === 'audio' && (
          <>
            <div className="form-group">
              <label className="form-label">🎧 Audio Type</label>
              <select className="diary-input" value={audioType} onChange={e => setAudioType(e.target.value)}>
                <option value="">Choose audio type...</option>
                <option value="Voice Note">Voice Note</option>
                <option value="Music">Music</option>
                <option value="Song">Song</option>
                <option value="Interview">Interview</option>
                <option value="Speech">Speech</option>
                <option value="Podcast">Podcast</option>
                <option value="Sound">Sound</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="studio-form__row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">🗣️ Speaker / Artist</label>
                <input
                  className="diary-input"
                  value={speaker}
                  onChange={e => setSpeaker(e.target.value)}
                  placeholder="Who is speaking or performing?"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">⏱️ Duration</label>
                <input
                  className="diary-input"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 2:30, 5 min..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">🎤 Occasion</label>
              <input
                className="diary-input"
                value={occasion}
                onChange={e => setOccasion(e.target.value)}
                placeholder="When or why was this recorded?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">💭 Emotions & Feelings</label>
              <textarea
                className="diary-textarea"
                rows={2}
                value={emotions}
                onChange={e => setEmotions(e.target.value)}
                placeholder="How does this audio make you feel?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">📜 Transcript</label>
              <textarea
                className="diary-textarea"
                rows={3}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Optional transcript of the audio..."
              />
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="studio-form__actions">
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? '💾 Saving...' : '✨ Save Memory'}
          </button>
        </div>
      </div>

      {/* Toast */}
      <div className={`studio-toast ${toast ? 'show' : ''}`}>
        {toast}
      </div>
    </div>
  );
}
