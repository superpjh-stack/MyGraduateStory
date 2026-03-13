-- MyGraduate: 초기 스키마 마이그레이션
-- Supabase SQL Editor에서 실행

-- =====================================
-- 1. profiles
-- =====================================
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

-- =====================================
-- 2. subjects (과목)
-- =====================================
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

-- =====================================
-- 3. sessions (수업 기록)
-- =====================================
CREATE TYPE day_type AS ENUM ('friday_evening','saturday_morning','saturday_afternoon','saturday_evening');
CREATE TYPE emotion_type AS ENUM ('excited','focused','confused','tired','inspired','satisfied');
CREATE TYPE session_status AS ENUM ('draft','completed','archived');

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

-- =====================================
-- 4. session_attachments
-- =====================================
CREATE TABLE IF NOT EXISTS session_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================
-- 5. reflections (주간 회고)
-- =====================================
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

-- =====================================
-- 6. time_capsules (타임캡슐)
-- =====================================
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

-- =====================================
-- 7. achievements (배지)
-- =====================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL
);

-- =====================================
-- 8. growth_snapshots (성장 스냅샷)
-- =====================================
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

-- =====================================
-- 9. self_assessments (자기 평가)
-- =====================================
CREATE TYPE assessment_type AS ENUM ('initial','monthly','final');

CREATE TABLE IF NOT EXISTS self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type assessment_type NOT NULL,
  responses JSONB DEFAULT '{}' NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================
-- Triggers: updated_at 자동 갱신
-- =====================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_subjects
  BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_sessions
  BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_reflections
  BEFORE UPDATE ON reflections FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =====================================
-- Trigger: 신규 유저 프로필 자동 생성
-- =====================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================
-- RLS (Row Level Security)
-- =====================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_assessments ENABLE ROW LEVEL SECURITY;

-- profiles RLS
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL USING (auth.uid() = user_id);

-- subjects RLS
CREATE POLICY "Users can manage own subjects"
  ON subjects FOR ALL USING (auth.uid() = user_id);

-- sessions RLS
CREATE POLICY "Users can manage own sessions"
  ON sessions FOR ALL USING (auth.uid() = user_id);

-- session_attachments RLS (세션 소유자만)
CREATE POLICY "Users can manage own attachments"
  ON session_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM sessions WHERE sessions.id = session_id AND sessions.user_id = auth.uid()
  ));

-- reflections RLS
CREATE POLICY "Users can manage own reflections"
  ON reflections FOR ALL USING (auth.uid() = user_id);

-- time_capsules RLS
CREATE POLICY "Users can manage own time_capsules"
  ON time_capsules FOR ALL USING (auth.uid() = user_id);

-- achievements RLS
CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT USING (auth.uid() = user_id);

-- growth_snapshots RLS
CREATE POLICY "Users can manage own growth_snapshots"
  ON growth_snapshots FOR ALL USING (auth.uid() = user_id);

-- self_assessments RLS
CREATE POLICY "Users can manage own self_assessments"
  ON self_assessments FOR ALL USING (auth.uid() = user_id);
