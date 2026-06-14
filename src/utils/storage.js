// Dear Me — Dual Storage Utility
// localStorage (instant, offline) + Supabase (background sync)

import { saveDiaryEntry, updateDiaryEntry as sbUpdateEntry, deleteDiaryEntry as sbDeleteEntry, uploadMedia } from '../services/backend';
import { savePatientProfile } from '../services/backend';

const STORAGE_KEY = 'dearme_diary';
const PROFILE_KEY = 'dearme_profile';
const PATIENT_ID_KEY = 'dearme_patient_id';

// ──────────────────────────────────────────────
// Patient ID management
// ──────────────────────────────────────────────

/**
 * Get or create a stable patient ID for this device.
 * Used to link all data across localStorage and Supabase.
 */
export function getOrCreatePatientId() {
  let id = localStorage.getItem(PATIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    localStorage.setItem(PATIENT_ID_KEY, id);
  }
  return id;
}

// ──────────────────────────────────────────────
// Core localStorage operations (unchanged API)
// ──────────────────────────────────────────────

export function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultData();
  } catch {
    return getDefaultData();
  }
}

export function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefaultData() {
  return {
    friends: [],
    places: [],
    relationships: [],
    sad: [],
    lessons: [],
    happy: [],
    bucket: [],
    dates: [],
    philosophy: [],
    audio: [],
    mothertongue: [],
    settings: { theme: 'light' }
  };
}

// ──────────────────────────────────────────────
// CRUD for any section (with background Supabase sync)
// ──────────────────────────────────────────────

export function getEntries(section) {
  return getAll()[section] || [];
}

export function addEntry(section, entry) {
  const data = getAll();
  
  const rawFile = entry.rawFile;
  const entryData = { ...entry };
  delete entryData.rawFile;

  const newEntry = {
    ...entryData,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString()
  };

  data[section] = [newEntry, ...(data[section] || [])];
  saveAll(data);

  // Background Supabase sync
  const patientId = getOrCreatePatientId();
  
  if (rawFile) {
    // Generate safe filename
    const safeName = rawFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${patientId}/${newEntry.id}_${safeName}`;
    
    // First save the entry to database without the photo URL
    saveDiaryEntry(patientId, section, newEntry).then(() => {
      // Then upload the file
      uploadMedia('scme-media', path, rawFile).then(url => {
        if (url) {
          // If successful, update the entry with the permanent public URL
          updateEntry(section, newEntry.id, { photo: url });
        }
      }).catch(err => console.error("Upload failed", err));
    }).catch(err => console.error("Save entry failed", err));
  } else {
    saveDiaryEntry(patientId, section, newEntry).catch(() => {});
  }

  return newEntry;
}

export function updateEntry(section, id, updates) {
  const data = getAll();
  data[section] = (data[section] || []).map(e =>
    e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
  );
  saveAll(data);

  // Background Supabase sync
  sbUpdateEntry(id, updates).catch(() => {});
}

export function deleteEntry(section, id) {
  const data = getAll();
  data[section] = (data[section] || []).filter(e => e.id !== id);
  saveAll(data);

  // Background Supabase sync
  sbDeleteEntry(id).catch(() => {});
}

// ──────────────────────────────────────────────
// Settings
// ──────────────────────────────────────────────

export function getSettings() {
  return getAll().settings || { theme: 'light' };
}

export function saveSetting(key, value) {
  const data = getAll();
  data.settings = { ...data.settings, [key]: value };
  saveAll(data);
}

// ──────────────────────────────────────────────
// Profile (About Me)
// ──────────────────────────────────────────────

/**
 * Get the About Me profile from localStorage.
 */
export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save the About Me profile to localStorage + Supabase.
 */
export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // Background Supabase sync
  const patientId = getOrCreatePatientId();
  savePatientProfile({
    clientId: patientId,
    name: profile.identity?.name,
    nickname: profile.identity?.nickname,
    dateOfBirth: profile.identity?.dateOfBirth,
    hometown: profile.identity?.hometown,
    currentLocation: profile.identity?.currentLocation,
    motherTongue: profile.identity?.motherTongue,
    lifesWork: profile.identity?.lifesWork,
    photoUrl: profile.photo,
    personalityTraits: profile.personalityBlueprint?.coreTraits,
    whatCalmsMe: profile.personalityBlueprint?.whatCalmsMe,
    whatMakesMeHappy: profile.personalityBlueprint?.whatMakesMeHappy,
    mostProudOf: profile.personalityBlueprint?.mostProudOf,
    coreValues: profile.coreValues,
    careProtocol: profile.careProtocol,
    voiceSelfPortrait: profile.voiceProfile?.selfPortrait,
    voiceWantPeopleToKnow: profile.voiceProfile?.wantPeopleToKnow,
    voiceFeelsLikeHome: profile.voiceProfile?.feelsLikeHome,
    userContextProfile: profile,
  }).catch(() => {});
}

// ──────────────────────────────────────────────
// Cross-section search
// ──────────────────────────────────────────────

export function searchAllEntries(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const data = getAll();
  const results = [];
  const sections = ['friends', 'places', 'relationships', 'sad', 'lessons', 'happy', 'bucket', 'dates', 'philosophy', 'audio', 'mothertongue'];
  
  sections.forEach(section => {
    (data[section] || []).forEach(entry => {
      const text = JSON.stringify(entry).toLowerCase();
      if (text.includes(q)) {
        results.push({ ...entry, _section: section });
      }
    });
  });
  
  return results;
}

// ──────────────────────────────────────────────
// Photo helper — convert file to base64 data URL
// ──────────────────────────────────────────────

export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
