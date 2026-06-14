// Dear Me — Supabase Backend Service
// Browser-side equivalent of 02_scme_backend.py
// All methods are safe to call even when Supabase is not configured

import supabase, { isSupabaseConfigured } from '../lib/supabase';

/**
 * Log a warning but never throw — the app must always work offline.
 */
function logError(operation, error) {
  console.warn(`[DearMe Backend] ${operation} failed:`, error?.message || error);
}

// ──────────────────────────────────────────────
// PATIENTS (About Me profile)
// ──────────────────────────────────────────────

/**
 * Upsert a patient profile. Uses client_id for conflict resolution.
 * @param {object} profile - Patient profile data
 * @returns {object|null} The saved patient row, or null on failure
 */
export async function savePatientProfile(profile) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('patients')
      .upsert(
        {
          client_id: profile.clientId,
          full_name: profile.name,
          nickname: profile.nickname,
          date_of_birth: profile.dateOfBirth || null,
          hometown: profile.hometown,
          current_location: profile.currentLocation,
          mother_tongue: profile.motherTongue,
          lifes_work: profile.lifesWork,
          photo_url: profile.photoUrl || null,
          personality_traits: profile.personalityTraits || [],
          what_calms_me: profile.whatCalmsMe,
          what_makes_me_happy: profile.whatMakesMeHappy,
          most_proud_of: profile.mostProudOf,
          core_values: profile.coreValues || [],
          care_protocol: profile.careProtocol || [],
          voice_self_portrait: profile.voiceSelfPortrait,
          voice_want_people_to_know: profile.voiceWantPeopleToKnow,
          voice_feels_like_home: profile.voiceFeelsLikeHome,
          user_context_profile: profile.userContextProfile || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('savePatientProfile', err);
    return null;
  }
}

/**
 * Get a patient profile by client_id.
 * @param {string} clientId - Local device patient ID
 * @returns {object|null}
 */
export async function getPatientProfile(clientId) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  } catch (err) {
    logError('getPatientProfile', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// DIARY ENTRIES (all 9 sections)
// ──────────────────────────────────────────────

/**
 * Save a new diary entry to Supabase.
 * @param {string} patientId - client_id of the patient
 * @param {string} section - Section key (friends, places, etc.)
 * @param {object} entry - Full entry data from localStorage
 * @returns {object|null}
 */
export async function saveDiaryEntry(patientId, section, entry) {
  if (!isSupabaseConfigured()) return null;
  try {
    // Separate known columns from the JSONB blob
    const { id, title, mood, date, photo, completed, createdAt, updatedAt, ...rest } = entry;

    const { data, error } = await supabase
      .from('diary_entries')
      .upsert(
        {
          client_entry_id: id,
          patient_id: patientId,
          section,
          title,
          mood,
          entry_date: date || null,
          completed: completed || false,
          photo_path: photo || null,
          entry_data: rest,        // everything else goes into JSONB
          created_at: createdAt,
          updated_at: updatedAt || new Date().toISOString(),
        },
        { onConflict: 'client_entry_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('saveDiaryEntry', err);
    return null;
  }
}

/**
 * Update an existing diary entry in Supabase.
 * @param {string} clientEntryId - Local entry ID
 * @param {object} updates - Fields to update
 * @returns {object|null}
 */
export async function updateDiaryEntry(clientEntryId, updates) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { title, mood, date, photo, completed, ...rest } = updates;

    const updatePayload = { updated_at: new Date().toISOString() };
    if (title !== undefined) updatePayload.title = title;
    if (mood !== undefined) updatePayload.mood = mood;
    if (date !== undefined) updatePayload.entry_date = date;
    if (completed !== undefined) updatePayload.completed = completed;
    if (photo !== undefined) updatePayload.photo_path = photo;
    if (Object.keys(rest).length > 0) updatePayload.entry_data = rest;

    const { data, error } = await supabase
      .from('diary_entries')
      .update(updatePayload)
      .eq('client_entry_id', clientEntryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('updateDiaryEntry', err);
    return null;
  }
}

/**
 * Delete a diary entry from Supabase.
 * @param {string} clientEntryId - Local entry ID
 * @returns {boolean}
 */
export async function deleteDiaryEntry(clientEntryId) {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('client_entry_id', clientEntryId);

    if (error) throw error;
    return true;
  } catch (err) {
    logError('deleteDiaryEntry', err);
    return false;
  }
}

/**
 * Get all diary entries for a patient in a specific section.
 * @param {string} patientId - client_id (UUID from patients table)
 * @param {string} section - Section key
 * @returns {Array}
 */
export async function getDiaryEntries(patientId, section) {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('patient_id', patientId)
      .eq('section', section)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    logError('getDiaryEntries', err);
    return [];
  }
}

// ──────────────────────────────────────────────
// SESSIONS (SCME pipeline runs)
// ──────────────────────────────────────────────

/**
 * Create a new SCME session.
 */
export async function createSession(patientId, textInput) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        patient_id: patientId,
        text_input: textInput,
        session_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('createSession', err);
    return null;
  }
}

/**
 * Update an existing session with analysis results.
 */
export async function updateSession(sessionId, updates) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('updateSession', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// MEMORY GRAPH (Synthetic Brain)
// ──────────────────────────────────────────────

/**
 * Save or update the memory graph for a patient.
 */
export async function saveMemoryGraph(patientId, graphData) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('memory_graph')
      .upsert(
        {
          patient_id: patientId,
          cognitive_summary: graphData.cognitiveSummary,
          graph_data: graphData.graphData || {},
          emotional_map: graphData.emotionalMap || {},
          temporal_markers: graphData.temporalMarkers || [],
          version: (graphData.version || 0) + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'patient_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('saveMemoryGraph', err);
    return null;
  }
}

/**
 * Get the latest memory graph for a patient.
 */
export async function getMemoryGraph(patientId) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('memory_graph')
      .select('*')
      .eq('patient_id', patientId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    logError('getMemoryGraph', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// FACE REGISTRY
// ──────────────────────────────────────────────

/**
 * Save a face embedding to the registry.
 */
export async function saveFaceEmbedding(patientId, personName, embedding, photoPath) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('face_registry')
      .insert({
        patient_id: patientId,
        person_name: personName,
        embedding,
        photo_path: photoPath || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('saveFaceEmbedding', err);
    return null;
  }
}

/**
 * Load all face embeddings for a patient.
 */
export async function loadFaceRegistry(patientId) {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data, error } = await supabase
      .from('face_registry')
      .select('*')
      .eq('patient_id', patientId);

    if (error) throw error;

    // Group by person_name
    const registry = {};
    (data || []).forEach(row => {
      if (!registry[row.person_name]) registry[row.person_name] = [];
      registry[row.person_name].push(row.embedding);
    });
    return registry;
  } catch (err) {
    logError('loadFaceRegistry', err);
    return {};
  }
}

// ──────────────────────────────────────────────
// MEDIA ITEMS
// ──────────────────────────────────────────────

/**
 * Save a media analysis result.
 */
export async function saveMediaItem(sessionId, patientId, item) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('media_items')
      .insert({
        session_id: sessionId,
        patient_id: patientId,
        media_type: item.mediaType,
        file_path: item.filePath || null,
        analysis: item.analysis || {},
        detected_faces: item.detectedFaces || [],
        detected_objects: item.detectedObjects || [],
        caption: item.caption || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('saveMediaItem', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// AUDIO MEMORIES
// ──────────────────────────────────────────────

/**
 * Save a new audio memory to Supabase.
 * Also inserts a row into media_items with media_type='audio'.
 * @param {string} patientId - patient UUID
 * @param {object} entry - Audio entry data from localStorage
 * @returns {object|null}
 */
export async function saveAudioMemory(patientId, entry) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from('audio_memories')
      .upsert(
        {
          client_entry_id: entry.id,
          patient_id: patientId,
          title: entry.title,
          description: entry.description || null,
          audio_type: entry.audioType || null,
          speaker: entry.speaker || null,
          occasion: entry.occasion || null,
          transcript: entry.transcript || null,
          emotions: entry.emotions || null,
          audio_path: entry.photo || null,       // photo field holds the media URL
          duration: entry.duration || null,
          mood: entry.mood || null,
          entry_date: entry.date || null,
          created_at: entry.createdAt,
          updated_at: entry.updatedAt || new Date().toISOString(),
        },
        { onConflict: 'client_entry_id' }
      )
      .select()
      .single();

    if (error) throw error;

    // Also record in media_items for the scme-media bucket record
    try {
      await supabase.from('media_items').insert({
        patient_id: patientId,
        media_type: 'audio',
        file_path: entry.photo || null,
        caption: entry.title || null,
        analysis: {
          audioType: entry.audioType,
          speaker: entry.speaker,
          occasion: entry.occasion,
          emotions: entry.emotions,
          duration: entry.duration,
        },
      });
    } catch (mediaErr) {
      logError('saveAudioMemory → media_items', mediaErr);
    }

    return data;
  } catch (err) {
    logError('saveAudioMemory', err);
    return null;
  }
}

/**
 * Update an existing audio memory in Supabase.
 * @param {string} clientEntryId - Local entry ID
 * @param {object} updates - Fields to update
 * @returns {object|null}
 */
export async function updateAudioMemory(clientEntryId, updates) {
  if (!isSupabaseConfigured()) return null;
  try {
    const updatePayload = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.audioType !== undefined) updatePayload.audio_type = updates.audioType;
    if (updates.speaker !== undefined) updatePayload.speaker = updates.speaker;
    if (updates.occasion !== undefined) updatePayload.occasion = updates.occasion;
    if (updates.transcript !== undefined) updatePayload.transcript = updates.transcript;
    if (updates.emotions !== undefined) updatePayload.emotions = updates.emotions;
    if (updates.duration !== undefined) updatePayload.duration = updates.duration;
    if (updates.mood !== undefined) updatePayload.mood = updates.mood;
    if (updates.date !== undefined) updatePayload.entry_date = updates.date;
    if (updates.photo !== undefined) updatePayload.audio_path = updates.photo;

    const { data, error } = await supabase
      .from('audio_memories')
      .update(updatePayload)
      .eq('client_entry_id', clientEntryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('updateAudioMemory', err);
    return null;
  }
}

/**
 * Delete an audio memory from Supabase.
 * @param {string} clientEntryId - Local entry ID
 * @returns {boolean}
 */
export async function deleteAudioMemory(clientEntryId) {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from('audio_memories')
      .delete()
      .eq('client_entry_id', clientEntryId);

    if (error) throw error;
    return true;
  } catch (err) {
    logError('deleteAudioMemory', err);
    return false;
  }
}

/**
 * Get all audio memories for a patient.
 * @param {string} patientId - patient UUID
 * @returns {Array}
 */
export async function getAudioMemories(patientId) {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('audio_memories')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    logError('getAudioMemories', err);
    return [];
  }
}

// ──────────────────────────────────────────────
// VAULT CLUSTERS
// ──────────────────────────────────────────────

/**
 * Save Obsidian vault clusters.
 */
export async function saveVaultClusters(patientId, clusters) {
  if (!isSupabaseConfigured()) return null;
  try {
    const rows = clusters.map(c => ({
      patient_id: patientId,
      cluster_label: c.label,
      cluster_data: c.data || {},
      document_ids: c.documentIds || [],
      centroid: c.centroid || [],
    }));

    const { data, error } = await supabase
      .from('vault_clusters')
      .insert(rows)
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    logError('saveVaultClusters', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// STORAGE (File uploads)
// ──────────────────────────────────────────────

/**
 * Upload a file to a Supabase Storage bucket.
 * @param {string} bucket - Bucket name (scme-media, scme-pdfs, scme-faces)
 * @param {string} path - File path within the bucket
 * @param {File|Blob} file - The file to upload
 * @returns {string|null} Public URL or null
 */
export async function uploadMedia(bucket, path, file) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (err) {
    logError('uploadMedia', err);
    return null;
  }
}

/**
 * Fetch and concatenate all markdown files from the 'obsidien files' bucket.
 * @returns {Promise<string>} The concatenated text content.
 */
export async function fetchObsidianKnowledgeBase() {
  if (!isSupabaseConfigured()) return '';
  try {
    const bucket = 'obsidien files';
    const { data: files, error: listError } = await supabase.storage.from(bucket).list();
    if (listError) throw listError;
    if (!files || files.length === 0) return '';

    let knowledgeBase = '';
    
    // Process sequentially to preserve order and avoid overwhelming the network
    for (const file of files) {
      if (file.name === '.emptyFolderPlaceholder') continue;
      
      const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(file.name);
      if (downloadError) {
        console.warn(`[Backend] Failed to download obsidian file ${file.name}:`, downloadError);
        continue;
      }
      
      const text = await fileData.text();
      knowledgeBase += `\n\n--- Source: ${file.name} ---\n\n${text}`;
    }

    return knowledgeBase;
  } catch (err) {
    logError('fetchObsidianKnowledgeBase', err);
    return '';
  }
}

/**
 * Get a signed download URL for a file in storage.
 * @param {string} bucket - Bucket name
 * @param {string} path - File path
 * @param {number} expiresIn - Seconds until URL expires (default 1 hour)
 * @returns {string|null}
 */
export async function getMediaUrl(bucket, path, expiresIn = 3600) {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data?.signedUrl || null;
  } catch (err) {
    logError('getMediaUrl', err);
    return null;
  }
}

// ──────────────────────────────────────────────
// Convenience: export all as a namespace
// ──────────────────────────────────────────────
const backend = {
  // Patient
  savePatientProfile,
  getPatientProfile,
  // Diary
  saveDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
  getDiaryEntries,
  // Session
  createSession,
  updateSession,
  // Memory
  saveMemoryGraph,
  getMemoryGraph,
  // Face
  saveFaceEmbedding,
  loadFaceRegistry,
  // Media
  saveMediaItem,
  uploadMedia,
  getMediaUrl,
  // Audio
  saveAudioMemory,
  updateAudioMemory,
  deleteAudioMemory,
  getAudioMemories,
  // Vault
  saveVaultClusters,
};

export default backend;
