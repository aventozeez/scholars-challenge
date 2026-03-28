-- =====================================================
-- AventoLinks Scholars Challenge — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Registrations (public form submissions)
CREATE TABLE sc_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  class_level TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('science', 'arts', 'commercial')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition events
CREATE TABLE sc_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  state TEXT,
  registration_start DATE,
  registration_end DATE,
  event_date DATE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schools
CREATE TABLE sc_schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone TEXT,
  state TEXT NOT NULL,
  lga TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students (after qualifying)
CREATE TABLE sc_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES sc_schools(id),
  full_name TEXT NOT NULL,
  class_level TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('science', 'arts', 'commercial')),
  phone TEXT,
  email TEXT,
  exam_score NUMERIC DEFAULT 0,
  qualification_status TEXT DEFAULT 'pending' CHECK (qualification_status IN ('pending', 'qualified', 'disqualified')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE sc_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES sc_schools(id),
  team_name TEXT NOT NULL,
  captain_student_id UUID REFERENCES sc_students(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'eliminated', 'winner')),
  total_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members link table
CREATE TABLE sc_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES sc_teams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES sc_students(id),
  role TEXT DEFAULT 'member'
);

-- Questions bank
CREATE TABLE sc_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_type TEXT NOT NULL CHECK (round_type IN ('rapid_fire', 'buzzer', 'puzzle')),
  category TEXT NOT NULL CHECK (category IN ('science', 'arts', 'commercial', 'general')),
  subject TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_key TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 10,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Round sessions (each live round instance)
CREATE TABLE sc_round_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_type TEXT NOT NULL CHECK (round_type IN ('rapid_fire', 'buzzer', 'puzzle')),
  team_id UUID REFERENCES sc_teams(id),
  timer_seconds INTEGER DEFAULT 10,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Question attempts (core of recycle logic)
CREATE TABLE sc_question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sc_round_sessions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES sc_teams(id),
  question_id UUID REFERENCES sc_questions(id),
  result TEXT NOT NULL CHECK (result IN ('correct', 'wrong', 'pass', 'timeout')),
  recycle_count INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  appeared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scores per session
CREATE TABLE sc_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sc_round_sessions(id),
  team_id UUID REFERENCES sc_teams(id),
  raw_points INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  total_score INTEGER GENERATED ALWAYS AS (raw_points - penalties) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE sc_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a registration (public form)
CREATE POLICY "Allow public registration inserts"
  ON sc_registrations FOR INSERT
  WITH CHECK (true);

-- Public can read questions (for quiz play)
CREATE POLICY "Allow public question reads"
  ON sc_questions FOR SELECT
  USING (true);

-- Public can read teams/scores (for leaderboard)
CREATE POLICY "Allow public team reads"
  ON sc_teams FOR SELECT
  USING (true);

CREATE POLICY "Allow public score reads"
  ON sc_scores FOR SELECT
  USING (true);

-- =====================================================
-- Seed sample data
-- =====================================================

INSERT INTO sc_questions (round_type, category, subject, question_text, answer_key, difficulty, points) VALUES
  ('rapid_fire', 'science', 'Chemistry', 'What is the chemical symbol for Gold?', 'Au', 'easy', 10),
  ('rapid_fire', 'general', 'Geography', 'What is the capital of Ghana?', 'Accra', 'easy', 10),
  ('rapid_fire', 'arts', 'Literature', 'Who wrote "Things Fall Apart"?', 'Chinua Achebe', 'easy', 10),
  ('rapid_fire', 'science', 'Biology', 'What is the powerhouse of the cell?', 'Mitochondria', 'medium', 10),
  ('rapid_fire', 'commercial', 'Economics', 'What does GDP stand for?', 'Gross Domestic Product', 'easy', 10),
  ('rapid_fire', 'science', 'Mathematics', 'What is the square root of 144?', '12', 'easy', 10),
  ('rapid_fire', 'general', 'Geography', 'Name the longest river in Africa.', 'Nile', 'easy', 10),
  ('rapid_fire', 'science', 'Chemistry', 'What element has the symbol Fe?', 'Iron', 'easy', 10),
  ('rapid_fire', 'general', 'History', 'In what year did Nigeria gain independence?', '1960', 'easy', 10),
  ('rapid_fire', 'science', 'Physics', 'What is the approximate speed of light?', '300,000 km/s', 'medium', 10),
  ('buzzer', 'science', 'Biology', 'What gas do plants absorb during photosynthesis?', 'Carbon Dioxide (CO2)', 'easy', 10),
  ('buzzer', 'general', 'History', 'Who was the first President of Nigeria?', 'Nnamdi Azikiwe', 'medium', 10),
  ('puzzle', 'science', 'Chemistry', 'Unscramble: NEGXYO (an element essential for breathing)', 'OXYGEN', 'easy', 20);

-- =====================================================
-- Question Pools (1–30 pools, each with 10 questions)
-- =====================================================

CREATE TABLE sc_question_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_number INTEGER UNIQUE NOT NULL CHECK (pool_number BETWEEN 1 AND 30),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table linking pools to their 10 questions
CREATE TABLE sc_pool_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES sc_question_pools(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES sc_questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  UNIQUE(pool_id, question_id)
);

-- Indexes
CREATE INDEX idx_pool_questions_pool_id ON sc_pool_questions(pool_id);
CREATE INDEX idx_pool_questions_question_id ON sc_pool_questions(question_id);

-- Auto-update updated_at on pool edits
CREATE OR REPLACE FUNCTION update_pool_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pools_updated_at
  BEFORE UPDATE ON sc_question_pools
  FOR EACH ROW EXECUTE FUNCTION update_pool_updated_at();

-- RLS
ALTER TABLE sc_question_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE sc_pool_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pools"
  ON sc_question_pools FOR SELECT USING (true);

CREATE POLICY "Admin manage pools"
  ON sc_question_pools FOR ALL USING (true);

CREATE POLICY "Public read pool questions"
  ON sc_pool_questions FOR SELECT USING (true);

CREATE POLICY "Admin manage pool questions"
  ON sc_pool_questions FOR ALL USING (true);
