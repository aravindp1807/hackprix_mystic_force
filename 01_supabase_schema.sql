-- ============================================
-- DEAR ME — SCME Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. PATIENTS — one row per Alzheimer's patient
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       TEXT UNIQUE,                       -- local device ID
  full_name       TEXT,
  nickname        TEXT,
  date_of_birth   DATE,
  hometown        TEXT,
  current_location TEXT,
  mother_tongue   TEXT,
  lifes_work      TEXT,
  photo_url       TEXT,
  personality_traits JSONB DEFAULT '[]'::JSONB,       -- array of trait strings
  what_calms_me   TEXT,
  what_makes_me_happy TEXT,
  most_proud_of   TEXT,
  core_values     JSONB DEFAULT '[]'::JSONB,          -- ranked array of value strings
  care_protocol   JSONB DEFAULT '[]'::JSONB,          -- array of active care prefs
  voice_self_portrait TEXT,
  voice_want_people_to_know TEXT,
  voice_feels_like_home TEXT,
  user_context_profile JSONB DEFAULT '{}'::JSONB,     -- full computed profile
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_client_id ON patients(client_id);

-- ──────────────────────────────────────────────
-- 2. SESSIONS — one row per SCME pipeline run
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  session_date    TIMESTAMPTZ DEFAULT NOW(),
  text_input      TEXT,
  sentiment       JSONB DEFAULT '{}'::JSONB,
  keywords        JSONB DEFAULT '[]'::JSONB,
  entities        JSONB DEFAULT '[]'::JSONB,
  emotion_scores  JSONB DEFAULT '{}'::JSONB,
  pdf_path        TEXT,
  consistency     JSONB DEFAULT '{}'::JSONB,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_patient ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date DESC);

-- ──────────────────────────────────────────────
-- 3. MEMORY_GRAPH — synthesised "Synthetic Brain"
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memory_graph (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  cognitive_summary TEXT,
  graph_data      JSONB DEFAULT '{}'::JSONB,           -- nodes, edges, clusters
  emotional_map   JSONB DEFAULT '{}'::JSONB,
  temporal_markers JSONB DEFAULT '[]'::JSONB,
  version         INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_graph_patient ON memory_graph(patient_id);

-- ──────────────────────────────────────────────
-- 4. FACE_REGISTRY — FaceNet embeddings per patient
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS face_registry (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  person_name     TEXT NOT NULL,
  embedding       JSONB NOT NULL,                      -- float array as JSON
  photo_path      TEXT,                                -- path in scme-faces bucket
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_face_registry_patient ON face_registry(patient_id);
CREATE INDEX IF NOT EXISTS idx_face_registry_name ON face_registry(person_name);

-- ──────────────────────────────────────────────
-- 5. MEDIA_ITEMS — photo/video/audio analysis results
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  media_type      TEXT CHECK (media_type IN ('photo', 'video', 'audio')),
  file_path       TEXT,                                -- path in scme-media bucket
  analysis        JSONB DEFAULT '{}'::JSONB,           -- AI analysis results
  detected_faces  JSONB DEFAULT '[]'::JSONB,
  detected_objects JSONB DEFAULT '[]'::JSONB,
  caption         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_items_session ON media_items(session_id);
CREATE INDEX IF NOT EXISTS idx_media_items_patient ON media_items(patient_id);

-- ──────────────────────────────────────────────
-- 6. VAULT_CLUSTERS — Obsidian vault semantic clusters
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vault_clusters (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  cluster_label   TEXT,
  cluster_data    JSONB DEFAULT '{}'::JSONB,
  document_ids    JSONB DEFAULT '[]'::JSONB,
  centroid        JSONB DEFAULT '[]'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_clusters_patient ON vault_clusters(patient_id);

-- ──────────────────────────────────────────────
-- 7. DIARY_ENTRIES — all 9 diary section entries
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diary_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  client_entry_id TEXT,                                -- local ID from browser
  section         TEXT NOT NULL CHECK (section IN (
    'friends', 'places', 'relationships', 'sad',
    'lessons', 'happy', 'bucket', 'dates', 'philosophy'
  )),
  title           TEXT,
  entry_data      JSONB DEFAULT '{}'::JSONB,           -- all form fields
  photo_path      TEXT,                                -- path in scme-media if uploaded
  mood            TEXT,
  entry_date      DATE,
  completed       BOOLEAN DEFAULT FALSE,               -- for bucket list items
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diary_entries_patient ON diary_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_section ON diary_entries(section);
CREATE INDEX IF NOT EXISTS idx_diary_entries_client_id ON diary_entries(client_entry_id);

-- ──────────────────────────────────────────────
-- 8. AUDIO_MEMORIES — audio diary entries
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audio_memories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  client_entry_id TEXT,                                -- local ID from browser
  title           TEXT,
  description     TEXT,
  audio_type      TEXT CHECK (audio_type IN (
    'Voice Note', 'Music', 'Song', 'Interview',
    'Speech', 'Podcast', 'Sound', 'Other'
  )),
  speaker         TEXT,                                -- who is speaking / performing
  occasion        TEXT,                                -- when/why recorded
  transcript      TEXT,                                -- optional transcript
  emotions        TEXT,                                -- feelings associated
  audio_path      TEXT,                                -- path in scme-media bucket
  duration        TEXT,                                -- length of audio
  mood            TEXT,                                -- emoji mood
  entry_date      DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_memories_patient ON audio_memories(patient_id);
CREATE INDEX IF NOT EXISTS idx_audio_memories_client_id ON audio_memories(client_entry_id);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) — permissive for demo
-- ──────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_memories ENABLE ROW LEVEL SECURITY;

-- Permissive policies (allow all operations for anon + authenticated)
-- For production, replace these with user-specific policies

CREATE POLICY "Allow all on patients"
  ON patients FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on sessions"
  ON sessions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on memory_graph"
  ON memory_graph FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on face_registry"
  ON face_registry FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on media_items"
  ON media_items FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on vault_clusters"
  ON vault_clusters FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on diary_entries"
  ON diary_entries FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on audio_memories"
  ON audio_memories FOR ALL
  USING (true) WITH CHECK (true);

-- ──────────────────────────────────────────────
-- STORAGE BUCKET POLICIES (run separately if needed)
-- ──────────────────────────────────────────────
-- Note: Storage bucket creation is done via the Supabase Dashboard UI.
-- Create three PRIVATE buckets: scme-media, scme-pdfs, scme-faces
-- Then add these policies in Storage → Policies:

-- INSERT policy for each bucket:
--   CREATE POLICY "Allow uploads" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id IN ('scme-media', 'scme-pdfs', 'scme-faces'));

-- SELECT policy for each bucket:
--   CREATE POLICY "Allow reads" ON storage.objects
--     FOR SELECT USING (bucket_id IN ('scme-media', 'scme-pdfs', 'scme-faces'));

-- ============================================
-- DONE! All tables, indexes, and policies created.
-- ============================================
