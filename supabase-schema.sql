-- Supabase SQL Schema for Drinking Game Missions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS missions (
  id BIGSERIAL PRIMARY KEY,
  person1 TEXT NOT NULL,
  person2 TEXT NOT NULL,
  mission1 TEXT NOT NULL,
  mission2 TEXT NOT NULL,
  is_viewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on missions" ON missions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at DESC);

-- ============================================
-- Participants table with personal passwords
-- ============================================

CREATE TABLE IF NOT EXISTS participants (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on participants" ON participants
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert participants with random 4-digit passwords
INSERT INTO participants (name, password) VALUES
  ('김형진', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('노다비', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('정진철', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('최용선', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('지서연', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('황차해', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('양한목', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('신국희', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')),
  ('김민철', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'))
ON CONFLICT (name) DO NOTHING;

-- View to check all participants and their passwords (for admin)
-- SELECT * FROM participants;

-- ============================================
-- Game state table to persist current stage
-- ============================================

CREATE TABLE IF NOT EXISTS game_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  stage TEXT NOT NULL DEFAULT 'start',
  current_mission_id BIGINT REFERENCES missions(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on game_state" ON game_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert initial state (only one row allowed)
INSERT INTO game_state (id, stage, current_mission_id)
VALUES (1, 'start', NULL)
ON CONFLICT (id) DO NOTHING;
