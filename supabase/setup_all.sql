-- =============================================
-- MyGraduate: 전체 DB 설정 (중복 실행 안전)
-- =============================================

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  semester_start_date DATE,
  semester_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  professor TEXT,
  color TEXT DEFAULT '#2D5A3D' NOT NULL,
  description TEXT,
  schedule_day TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ
);

-- 3. ENUM 타입 (이미 있으면 무시)
DO $$ BEGIN
  CREATE TYPE day_type AS ENUM ('friday_evening','saturday_morning','saturday_afternoon','saturday_evening');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE emotion_type AS ENUM ('excited','focused','confused','tired','inspired','satisfied');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('draft','completed','archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE assessment_type AS ENUM ('initial','monthly','final');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER DEFAULT 1 NOT NULL,
  session_date DATE NOT NULL,
  day_type day_type NOT NULL,
  learned TEXT,
  felt TEXT,
  emotion_type emotion_type,
  emotion_intensity INTEGER CHECK (emotion_intensity BETWEEN 1 AND 10),
  keywords TEXT[] DEFAULT '{}' NOT NULL,
  photo_urls TEXT[] DEFAULT '{}' NOT NULL,
  is_quick_capture BOOLEAN DEFAULT FALSE NOT NULL,
  status session_status DEFAULT 'completed' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ
);

-- 5. session_attachments
CREATE TABLE IF NOT EXISTS session_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. reflections
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  summary TEXT,
  top_learnings TEXT[] DEFAULT '{}' NOT NULL,
  emotion_summary TEXT,
  next_week_goal TEXT,
  self_message TEXT,
  highlight_session_ids UUID[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ,
  UNIQUE (user_id, week_number, year)
);

-- 7. time_capsules
CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  written_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  open_at TIMESTAMPTZ NOT NULL,
  is_opened BOOLEAN DEFAULT FALSE NOT NULL,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL
);

-- 9. growth_snapshots
CREATE TABLE IF NOT EXISTS growth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0 NOT NULL,
  total_keywords INTEGER DEFAULT 0 NOT NULL,
  total_reflections INTEGER DEFAULT 0 NOT NULL,
  streak_weeks INTEGER DEFAULT 0 NOT NULL,
  growth_index INTEGER DEFAULT 0 NOT NULL,
  tree_level INTEGER DEFAULT 1 NOT NULL,
  season TEXT DEFAULT 'spring' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. self_assessments
CREATE TABLE IF NOT EXISTS self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type assessment_type NOT NULL,
  responses JSONB DEFAULT '{}' NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Triggers: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_subjects ON subjects;
CREATE TRIGGER set_updated_at_subjects BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_sessions ON sessions;
CREATE TRIGGER set_updated_at_sessions BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_reflections ON reflections;
CREATE TRIGGER set_updated_at_reflections BEFORE UPDATE ON reflections FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Trigger: 신규 유저 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;

-- RLS 정책
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own subjects" ON subjects;
CREATE POLICY "Users can manage own subjects" ON subjects FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own attachments" ON session_attachments;
CREATE POLICY "Users can manage own attachments" ON session_attachments FOR ALL
  USING (EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_id AND sessions.user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can manage own reflections" ON reflections;
CREATE POLICY "Users can manage own reflections" ON reflections FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own time_capsules" ON time_capsules;
CREATE POLICY "Users can manage own time_capsules" ON time_capsules FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read own achievements" ON achievements;
CREATE POLICY "Users can read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own growth_snapshots" ON growth_snapshots;
CREATE POLICY "Users can manage own growth_snapshots" ON growth_snapshots FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own self_assessments" ON self_assessments;
CREATE POLICY "Users can manage own self_assessments" ON self_assessments FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions (session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions (user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections (user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_week_year ON reflections (user_id, week_number, year);
CREATE INDEX IF NOT EXISTS idx_growth_snapshots_user_id ON growth_snapshots (user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects (user_id);

-- profiles 추가 컬럼
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
