-- Migration: 002_indexes
-- Performance indexes for common query patterns

-- sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_session_date
  ON sessions (session_date DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_subject_id
  ON sessions (subject_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date
  ON sessions (user_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_archived_at
  ON sessions (archived_at)
  WHERE archived_at IS NULL;

-- reflections table indexes
CREATE INDEX IF NOT EXISTS idx_reflections_user_id
  ON reflections (user_id);

CREATE INDEX IF NOT EXISTS idx_reflections_week_year
  ON reflections (user_id, week_number, year);

CREATE INDEX IF NOT EXISTS idx_reflections_archived_at
  ON reflections (archived_at)
  WHERE archived_at IS NULL;

-- growth_snapshots table indexes
CREATE INDEX IF NOT EXISTS idx_growth_snapshots_user_id
  ON growth_snapshots (user_id);

CREATE INDEX IF NOT EXISTS idx_growth_snapshots_snapshot_date
  ON growth_snapshots (user_id, snapshot_date DESC);

-- subjects table indexes
CREATE INDEX IF NOT EXISTS idx_subjects_user_id
  ON subjects (user_id);

CREATE INDEX IF NOT EXISTS idx_subjects_archived_at
  ON subjects (archived_at)
  WHERE archived_at IS NULL;
