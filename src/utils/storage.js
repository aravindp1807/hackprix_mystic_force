// Dear Me — localStorage utility
const STORAGE_KEY = 'dearme_diary';

function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultData();
  } catch {
    return getDefaultData();
  }
}

function saveAll(data) {
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
    settings: { theme: 'light' }
  };
}

// CRUD for any section
export function getEntries(section) {
  return getAll()[section] || [];
}

export function addEntry(section, entry) {
  const data = getAll();
  const newEntry = {
    ...entry,
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString()
  };
  data[section] = [newEntry, ...(data[section] || [])];
  saveAll(data);
  return newEntry;
}

export function updateEntry(section, id, updates) {
  const data = getAll();
  data[section] = (data[section] || []).map(e =>
    e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
  );
  saveAll(data);
}

export function deleteEntry(section, id) {
  const data = getAll();
  data[section] = (data[section] || []).filter(e => e.id !== id);
  saveAll(data);
}

export function getSettings() {
  return getAll().settings || { theme: 'light' };
}

export function saveSetting(key, value) {
  const data = getAll();
  data.settings = { ...data.settings, [key]: value };
  saveAll(data);
}

export function searchAllEntries(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const data = getAll();
  const results = [];
  const sections = ['friends', 'places', 'relationships', 'sad', 'lessons', 'happy', 'bucket', 'dates', 'philosophy'];
  
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

// Photo helper — convert file to base64 data URL
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
