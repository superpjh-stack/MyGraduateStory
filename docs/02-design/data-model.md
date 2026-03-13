# MyGraduate - 데이터 모델 설계

> **Summary**: MyGraduate 웹앱의 데이터베이스 스키마, API 설계, 데이터 흐름 정의
>
> **Project**: MyGraduate
> **Version**: 0.1.0
> **Author**: Backend Expert (개발자1 - 백엔드)
> **Date**: 2026-03-13
> **Status**: Draft
> **Planning Doc**: [product-requirements.md](../01-plan/product-requirements.md)
> **Architecture Doc**: [system-architecture.md](./system-architecture.md)

---

## 1. 데이터 모델 개요

### 1.1 설계 원칙

| 원칙 | 설명 |
|------|------|
| **Supabase First** | PostgreSQL + RLS 기반, Supabase SDK로 직접 접근 |
| **Single User Optimized** | 1인 사용자 기준이지만, user_id FK로 확장 가능하게 |
| **Soft Delete** | 1년치 기록은 소중한 자산 - 삭제 시 soft delete (archived_at) |
| **Timestamped** | 모든 테이블에 created_at, updated_at 자동 관리 |
| **Enum via Check** | 감정/상태 등은 PostgreSQL CHECK constraint 사용 |

### 1.2 ERD (Entity Relationship Diagram)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   profiles   │     │    subjects      │     │   sessions       │
│──────────────│     │──────────────────│     │──────────────────│
│ id (PK)      │     │ id (PK)          │     │ id (PK)          │
│ user_id (FK) │◄────│ user_id (FK)     │     │ user_id (FK)     │
│ display_name │     │ name             │     │ subject_id (FK)  │──────┐
│ avatar_url   │     │ professor        │     │ session_number   │      │
│ semester_    │     │ color            │     │ session_date     │      │
│  start_date  │     │ description      │     │ day_type         │      │
│ semester_    │     │ schedule_day     │     │ learned          │      │
│  end_date    │     │ order_index      │     │ felt             │      │
│ created_at   │     │ is_active        │     │ emotion_type     │      │
│ updated_at   │     │ created_at       │     │ emotion_intensity│      │
└──────────────┘     │ updated_at       │     │ keywords         │      │
       │             │ archived_at      │     │ photo_urls       │      │
       │             └──────────────────┘     │ is_quick_capture │      │
       │                    │                  │ status           │      │
       │                    │                  │ created_at       │      │
       │                    │                  │ updated_at       │      │
       │                    │                  │ archived_at      │      │
       │                    │                  └──────────────────┘      │
       │                    │                         │                  │
       │                    │                         │                  │
       │             ┌──────────────────┐     ┌──────────────────┐      │
       │             │  reflections     │     │ session_         │      │
       │             │──────────────────│     │  attachments     │      │
       │             │ id (PK)          │     │──────────────────│      │
       │             │ user_id (FK)     │     │ id (PK)          │      │
       │             │ week_number      │     │ session_id (FK)  │──────┘
       │             │ year             │     │ file_url         │
       │             │ summary          │     │ file_name        │
       │             │ top_learnings    │     │ file_type        │
       │             │ emotion_summary  │     │ created_at       │
       │             │ next_week_goal   │     └──────────────────┘
       │             │ self_message     │
       │             │ highlight_       │     ┌──────────────────┐
       │             │  session_ids     │     │ achievements     │
       │             │ created_at       │     │──────────────────│
       │             │ updated_at       │     │ id (PK)          │
       │             │ archived_at      │     │ user_id (FK)     │
       │             └──────────────────┘     │ badge_type       │
       │                                       │ title            │
       │             ┌──────────────────┐     │ description      │
       │             │ time_capsules    │     │ earned_at        │
       │             │──────────────────│     │ metadata         │
       │             │ id (PK)          │     └──────────────────┘
       │             │ user_id (FK)     │
       │             │ message          │     ┌──────────────────┐
       │             │ written_at       │     │ growth_snapshots │
       │             │ open_at          │     │──────────────────│
       │             │ is_opened        │     │ id (PK)          │
       │             │ opened_at        │     │ user_id (FK)     │
       │             │ created_at       │     │ snapshot_date    │
       │             └──────────────────┘     │ total_sessions   │
       │                                       │ total_keywords   │
       │             ┌──────────────────┐     │ total_reflections│
       │             │ self_assessments │     │ streak_weeks     │
       │             │──────────────────│     │ growth_index     │
       │             │ id (PK)          │     │ tree_level       │
       │             │ user_id (FK)     │     │ season           │
       │             │ assessment_type  │     │ created_at       │
       │             │ responses        │     └──────────────────┘
       │             │ taken_at         │
       │             │ created_at       │
       └─────────────┘──────────────────┘
```

---

## 2. 테이블 상세 정의

### 2.1 profiles (사용자 프로필)

Supabase Auth와 연동되는 프로필 테이블.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  semester_start_date DATE,
  semester_end_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- settings JSONB 예시:
-- {
--   "theme": "light",
--   "notification_enabled": true,
--   "class_days": ["friday", "saturday"],
--   "timezone": "Asia/Seoul"
-- }
```

### 2.2 subjects (과목)

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  professor TEXT,
  color TEXT NOT NULL DEFAULT '#2D5A3D',
  description TEXT,
  schedule_day TEXT CHECK (schedule_day IN ('friday', 'saturday', 'both')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_subjects_user ON subjects(user_id);
CREATE INDEX idx_subjects_active ON subjects(user_id, is_active);
```

### 2.3 sessions (수업 기록)

앱의 핵심 테이블. 매 수업의 기록을 저장.

```sql
CREATE TYPE emotion_type AS ENUM ('excited', 'focused', 'struggling', 'proud');
CREATE TYPE day_type AS ENUM ('friday', 'saturday');
CREATE TYPE session_status AS ENUM ('draft', 'completed');

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  session_date DATE NOT NULL,
  day_type day_type NOT NULL,

  -- 내용
  learned TEXT,                    -- 배운 것
  felt TEXT,                       -- 느낀 것

  -- 감정 온도계
  emotion_type emotion_type,
  emotion_intensity SMALLINT CHECK (emotion_intensity BETWEEN 1 AND 5),

  -- 메타데이터
  keywords TEXT[] DEFAULT '{}',    -- 키워드 태그 배열
  photo_urls TEXT[] DEFAULT '{}',  -- 사진 URL 배열
  is_quick_capture BOOLEAN DEFAULT FALSE,  -- Quick Capture 여부

  -- 상태
  status session_status DEFAULT 'draft',

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ
);

CREATE INDEX idx_sessions_user_date ON sessions(user_id, session_date DESC);
CREATE INDEX idx_sessions_subject ON sessions(subject_id);
CREATE INDEX idx_sessions_keywords ON sessions USING GIN(keywords);
CREATE INDEX idx_sessions_status ON sessions(user_id, status);
```

### 2.4 session_attachments (첨부 파일)

```sql
CREATE TABLE session_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,          -- 'image', 'document', 'link'
  file_size INTEGER,                -- bytes
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_attachments_session ON session_attachments(session_id);
```

### 2.5 reflections (주간 회고)

```sql
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,     -- 1~52
  year INTEGER NOT NULL,

  -- 회고 내용
  summary TEXT,                     -- 이번 주 한 줄 요약
  top_learnings TEXT[],             -- 핵심 배움 Top 3 (배열)
  emotion_summary TEXT,             -- 이번 주 감정 종합
  next_week_goal TEXT,              -- 다음 주 다짐
  self_message TEXT,                -- 이번 주 나에게 한마디

  -- 연결 데이터
  highlight_session_ids UUID[],     -- 이번 주 하이라이트 수업 ID

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  archived_at TIMESTAMPTZ,

  UNIQUE(user_id, year, week_number)
);

CREATE INDEX idx_reflections_user_week ON reflections(user_id, year DESC, week_number DESC);
```

### 2.6 time_capsules (타임캡슐)

Phase 2 기능이지만 스키마는 미리 정의.

```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  written_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  open_at TIMESTAMPTZ NOT NULL,     -- 열릴 시점
  is_opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_capsules_user ON time_capsules(user_id, open_at);
```

### 2.7 achievements (배지/성취)

Phase 2 기능이지만 스키마는 미리 정의.

```sql
CREATE TYPE badge_type AS ENUM (
  'first_session',       -- 첫 수업 기록
  'first_reflection',    -- 첫 주간 회고
  'streak_4',            -- 4주 연속 기록
  'streak_12',           -- 12주 연속 기록 (약 3개월)
  'streak_26',           -- 26주 연속 기록 (6개월)
  'streak_52',           -- 52주 연속 기록 (1년 완주!)
  'keywords_50',         -- 키워드 50개 달성
  'keywords_100',        -- 키워드 100개 달성
  'all_emotions',        -- 4가지 감정 모두 기록
  'halfway',             -- 반환점 통과
  'graduation'           -- 졸업!
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type badge_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}',

  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_achievements_user ON achievements(user_id, earned_at DESC);
```

### 2.8 growth_snapshots (성장 스냅샷)

성장 지수를 주기적으로 스냅샷. Growth Tree와 통계 차트의 데이터 소스.

```sql
CREATE TABLE growth_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,

  -- 누적 통계
  total_sessions INTEGER DEFAULT 0,
  total_keywords INTEGER DEFAULT 0,
  total_reflections INTEGER DEFAULT 0,
  total_attachments INTEGER DEFAULT 0,

  -- 성장 지표
  streak_weeks INTEGER DEFAULT 0,
  growth_index INTEGER DEFAULT 0,     -- 종합 성장 점수 (0~1000)

  -- Growth Tree 상태
  tree_level INTEGER DEFAULT 1,       -- 나무 레벨 (1~10)
  season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  leaf_count INTEGER DEFAULT 0,       -- 잎 수 (고유 키워드 수)
  fruit_count INTEGER DEFAULT 0,      -- 열매 수 (완료 과제 수)

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_growth_user_date ON growth_snapshots(user_id, snapshot_date DESC);
```

### 2.9 self_assessments (자가진단)

Before & After 비교용 (Phase 2).

```sql
CREATE TYPE assessment_type AS ENUM ('initial', 'midterm', 'final');

CREATE TABLE self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type assessment_type NOT NULL,

  -- 자가진단 응답 (JSONB로 유연하게)
  responses JSONB NOT NULL,
  -- {
  --   "ai_knowledge": 3,        // 1~5
  --   "coding_skill": 4,
  --   "research_ability": 2,
  --   "confidence": 3,
  --   "open_question": "AI에 대해 아직 모르는 것이 많다..."
  -- }

  taken_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, assessment_type)
);
```

---

## 3. Row Level Security (RLS) 정책

모든 테이블에 RLS를 적용하여 사용자가 자기 데이터만 접근 가능하도록 한다.

```sql
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

-- 공통 패턴: 자기 데이터만 CRUD 가능
CREATE POLICY "Users can manage own profiles"
  ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own subjects"
  ON subjects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- session_attachments: session의 소유자만 접근
CREATE POLICY "Users can manage own session attachments"
  ON session_attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_attachments.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own reflections"
  ON reflections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own time capsules"
  ON time_capsules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own achievements"
  ON achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own growth snapshots"
  ON growth_snapshots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own self assessments"
  ON self_assessments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 4. API 설계

### 4.1 API 접근 방식

Supabase Client SDK를 직접 사용하되, 복잡한 로직은 Next.js Server Actions로 처리.

```
클라이언트 → Supabase Client SDK → PostgreSQL (단순 CRUD)
클라이언트 → Next.js Server Action → Supabase Server SDK → PostgreSQL (복잡 로직)
```

### 4.2 주요 API 엔드포인트 (Server Actions)

#### Subjects (과목)

| Action | 함수명 | Input | Output |
|--------|--------|-------|--------|
| 목록 조회 | `getSubjects()` | - | `Subject[]` |
| 생성 | `createSubject(data)` | `{name, professor?, color, schedule_day}` | `Subject` |
| 수정 | `updateSubject(id, data)` | `{name?, professor?, color?, ...}` | `Subject` |
| 삭제(soft) | `archiveSubject(id)` | `id` | `void` |

#### Sessions (수업 기록)

| Action | 함수명 | Input | Output |
|--------|--------|-------|--------|
| 목록 조회 | `getSessions(filter?)` | `{subjectId?, dateFrom?, dateTo?, status?}` | `Session[]` |
| 상세 조회 | `getSession(id)` | `id` | `Session & Attachments` |
| 생성 | `createSession(data)` | `SessionInput` | `Session` |
| 수정 | `updateSession(id, data)` | `SessionInput` | `Session` |
| Quick Capture | `quickCapture(data)` | `{content, subjectId?}` | `Session` |
| 삭제(soft) | `archiveSession(id)` | `id` | `void` |

**SessionInput 타입:**
```typescript
interface SessionInput {
  subject_id: string;
  session_number: number;
  session_date: string;        // ISO date
  day_type: 'friday' | 'saturday';
  learned?: string;
  felt?: string;
  emotion_type?: EmotionType;
  emotion_intensity?: number;   // 1~5
  keywords?: string[];
  status?: 'draft' | 'completed';
}
```

#### Reflections (주간 회고)

| Action | 함수명 | Input | Output |
|--------|--------|-------|--------|
| 목록 조회 | `getReflections(year?)` | `year?` | `Reflection[]` |
| 상세 조회 | `getReflection(id)` | `id` | `Reflection` |
| 현재 주 조회 | `getCurrentWeekReflection()` | - | `Reflection?` |
| 생성 | `createReflection(data)` | `ReflectionInput` | `Reflection` |
| 수정 | `updateReflection(id, data)` | `ReflectionInput` | `Reflection` |

#### Growth (성장 데이터)

| Action | 함수명 | Input | Output |
|--------|--------|-------|--------|
| 대시보드 통계 | `getDashboardStats()` | - | `DashboardStats` |
| 성장 스냅샷 목록 | `getGrowthSnapshots(range?)` | `{from?, to?}` | `GrowthSnapshot[]` |
| 스냅샷 생성/갱신 | `updateGrowthSnapshot()` | - | `GrowthSnapshot` |
| Heatmap 데이터 | `getHeatmapData(year?)` | `year?` | `HeatmapEntry[]` |
| 키워드 통계 | `getKeywordStats()` | - | `KeywordStat[]` |
| 감정 통계 | `getEmotionStats(range?)` | `{from?, to?}` | `EmotionStat[]` |

**DashboardStats 타입:**
```typescript
interface DashboardStats {
  currentWeek: number;
  totalWeeks: number;
  totalSessions: number;
  totalReflections: number;
  currentStreak: number;
  growthIndex: number;
  treeLevel: number;
  season: string;
  thisWeekSessions: {
    friday: Session | null;
    saturday: Session | null;
  };
  recentSessions: Session[];
}
```

#### Timeline

| Action | 함수명 | Input | Output |
|--------|--------|-------|--------|
| 타임라인 조회 | `getTimeline(filter?)` | `{month?, year?, type?}` | `TimelineEntry[]` |

**TimelineEntry 타입:**
```typescript
interface TimelineEntry {
  id: string;
  type: 'session' | 'reflection' | 'achievement' | 'capsule';
  date: string;
  title: string;
  preview: string;
  emotion?: EmotionType;
  keywords?: string[];
  metadata: Record<string, unknown>;
}
```

### 4.3 Supabase Storage 구조

```
Storage Buckets:
├── session-photos/
│   └── {user_id}/
│       └── {session_id}/
│           └── {filename}
│
├── attachments/
│   └── {user_id}/
│       └── {session_id}/
│           └── {filename}
│
└── avatars/
    └── {user_id}/
        └── avatar.{ext}
```

Storage RLS:
```sql
-- session-photos bucket policy
CREATE POLICY "Users can upload own session photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'session-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own session photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 5. 성장 지수 (Growth Index) 계산 로직

### 5.1 구성 요소

```typescript
interface GrowthIndexFactors {
  sessionScore: number;      // 수업 기록 점수 (0~300)
  reflectionScore: number;   // 회고 점수 (0~200)
  streakScore: number;       // 연속 기록 점수 (0~200)
  depthScore: number;        // 기록 깊이 점수 (0~200)
  diversityScore: number;    // 키워드 다양성 점수 (0~100)
}

// 총합: 0~1000
```

### 5.2 계산 공식

```typescript
function calculateGrowthIndex(stats: UserStats): number {
  // 1. 수업 기록 점수 (최대 300)
  // 목표 기록 수: 104회 (52주 x 2회)
  const sessionScore = Math.min(300, (stats.totalSessions / 104) * 300);

  // 2. 회고 점수 (최대 200)
  // 목표 회고 수: 52회 (주간)
  const reflectionScore = Math.min(200, (stats.totalReflections / 52) * 200);

  // 3. 연속 기록 보너스 (최대 200)
  // 4주 이상부터 보너스, 52주 완주 시 만점
  const streakScore = Math.min(200, Math.max(0, (stats.streakWeeks - 3) / 49) * 200);

  // 4. 기록 깊이 점수 (최대 200)
  // 평균 기록 길이 + 감정 기록률 + 사진 첨부율
  const avgLength = stats.avgLearnedLength + stats.avgFeltLength;
  const lengthScore = Math.min(100, (avgLength / 500) * 100);
  const emotionRate = stats.emotionRecordRate * 50;
  const photoRate = stats.photoAttachRate * 50;
  const depthScore = lengthScore + emotionRate + photoRate;

  // 5. 키워드 다양성 (최대 100)
  const diversityScore = Math.min(100, (stats.uniqueKeywords / 100) * 100);

  return Math.round(sessionScore + reflectionScore + streakScore + depthScore + diversityScore);
}
```

### 5.3 Tree Level 매핑

```typescript
const TREE_LEVELS: { level: number; minIndex: number; name: string; description: string }[] = [
  { level: 1,  minIndex: 0,    name: '씨앗',       description: '여정이 시작되었어요' },
  { level: 2,  minIndex: 50,   name: '새싹',       description: '작은 싹이 돋아났어요' },
  { level: 3,  minIndex: 120,  name: '어린 나무',   description: '뿌리를 내리고 있어요' },
  { level: 4,  minIndex: 200,  name: '자라는 나무', description: '가지가 뻗어나가고 있어요' },
  { level: 5,  minIndex: 320,  name: '잎이 무성한 나무', description: '지식의 잎이 풍성해요' },
  { level: 6,  minIndex: 450,  name: '꽃피는 나무', description: '배움이 꽃으로 피어나요' },
  { level: 7,  minIndex: 580,  name: '열매 맺는 나무', description: '노력의 결실이 보여요' },
  { level: 8,  minIndex: 720,  name: '큰 나무',    description: '든든한 전문가의 나무예요' },
  { level: 9,  minIndex: 860,  name: '고목',       description: '깊은 지혜의 나무예요' },
  { level: 10, minIndex: 950,  name: '세계수',     description: '석사의 자격을 갖추었어요!' },
];
```

---

## 6. Database Functions & Triggers

### 6.1 자동 updated_at 갱신

```sql
-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 6.2 프로필 자동 생성 (Auth Trigger)

```sql
-- 회원가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 6.3 성장 스냅샷 자동 갱신

```sql
-- 수업 기록 생성/수정 시 성장 스냅샷 갱신
CREATE OR REPLACE FUNCTION update_growth_on_session()
RETURNS TRIGGER AS $$
DECLARE
  snapshot_exists BOOLEAN;
  today DATE := CURRENT_DATE;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM growth_snapshots
    WHERE user_id = NEW.user_id AND snapshot_date = today
  ) INTO snapshot_exists;

  IF snapshot_exists THEN
    UPDATE growth_snapshots SET
      total_sessions = (SELECT COUNT(*) FROM sessions WHERE user_id = NEW.user_id AND archived_at IS NULL),
      total_keywords = (SELECT COUNT(DISTINCT unnest) FROM sessions, unnest(keywords) WHERE user_id = NEW.user_id AND archived_at IS NULL),
      updated_at = NOW()
    WHERE user_id = NEW.user_id AND snapshot_date = today;
  ELSE
    INSERT INTO growth_snapshots (user_id, snapshot_date, total_sessions, total_keywords)
    VALUES (
      NEW.user_id,
      today,
      (SELECT COUNT(*) FROM sessions WHERE user_id = NEW.user_id AND archived_at IS NULL),
      (SELECT COUNT(DISTINCT unnest) FROM sessions, unnest(keywords) WHERE user_id = NEW.user_id AND archived_at IS NULL)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_change
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_growth_on_session();
```

---

## 7. TypeScript 타입 정의

### 7.1 핵심 타입

```typescript
// types/database.ts

export type EmotionType = 'excited' | 'focused' | 'struggling' | 'proud';
export type DayType = 'friday' | 'saturday';
export type SessionStatus = 'draft' | 'completed';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type BadgeType =
  | 'first_session' | 'first_reflection'
  | 'streak_4' | 'streak_12' | 'streak_26' | 'streak_52'
  | 'keywords_50' | 'keywords_100'
  | 'all_emotions' | 'halfway' | 'graduation';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  semester_start_date: string | null;
  semester_end_date: string | null;
  onboarding_completed: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  professor: string | null;
  color: string;
  description: string | null;
  schedule_day: 'friday' | 'saturday' | 'both' | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  subject_id: string | null;
  session_number: number;
  session_date: string;
  day_type: DayType;
  learned: string | null;
  felt: string | null;
  emotion_type: EmotionType | null;
  emotion_intensity: number | null;
  keywords: string[];
  photo_urls: string[];
  is_quick_capture: boolean;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  // Relations
  subject?: Subject;
  attachments?: SessionAttachment[];
}

export interface SessionAttachment {
  id: string;
  session_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  week_number: number;
  year: number;
  summary: string | null;
  top_learnings: string[] | null;
  emotion_summary: string | null;
  next_week_goal: string | null;
  self_message: string | null;
  highlight_session_ids: string[] | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface GrowthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_sessions: number;
  total_keywords: number;
  total_reflections: number;
  total_attachments: number;
  streak_weeks: number;
  growth_index: number;
  tree_level: number;
  season: Season | null;
  leaf_count: number;
  fruit_count: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  title: string;
  description: string | null;
  earned_at: string;
  metadata: Record<string, unknown>;
}

export interface TimeCapsule {
  id: string;
  user_id: string;
  message: string;
  written_at: string;
  open_at: string;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
}
```

---

## 8. 마이그레이션 전략

### 8.1 마이그레이션 순서

```
supabase/migrations/
├── 001_create_profiles.sql
├── 002_create_subjects.sql
├── 003_create_sessions.sql
├── 004_create_session_attachments.sql
├── 005_create_reflections.sql
├── 006_create_time_capsules.sql
├── 007_create_achievements.sql
├── 008_create_growth_snapshots.sql
├── 009_create_self_assessments.sql
├── 010_create_rls_policies.sql
├── 011_create_functions_triggers.sql
└── 012_create_storage_buckets.sql
```

### 8.2 Seed 데이터 (개발용)

```sql
-- supabase/seed.sql
-- 테스트용 과목 데이터
INSERT INTO subjects (user_id, name, professor, color, schedule_day, order_index)
VALUES
  ('TEST_USER_ID', 'AI 윤리학', '김교수', '#2D5A3D', 'friday', 1),
  ('TEST_USER_ID', '강화학습', '이교수', '#C4956A', 'saturday', 2),
  ('TEST_USER_ID', '자연어 처리', '박교수', '#E8B84B', 'friday', 3),
  ('TEST_USER_ID', '컴퓨터 비전', '최교수', '#7CB98B', 'saturday', 4);
```

---

## 9. 백업 & 데이터 안전

### 9.1 자동 백업

| 레벨 | 방법 | 주기 |
|------|------|------|
| Supabase | 자동 백업 (Pro 플랜) | 일간 |
| 수동 | `pg_dump` via Supabase CLI | 주간 권장 |
| Export | JSON Export 기능 (앱 내) | 사용자 수동 |

### 9.2 데이터 Export 형식

```typescript
interface ExportData {
  exportedAt: string;
  version: string;
  profile: Profile;
  subjects: Subject[];
  sessions: Session[];
  reflections: Reflection[];
  growthSnapshots: GrowthSnapshot[];
  achievements: Achievement[];
}
```

JSON 파일로 Export하여 데이터 이식성 보장.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial data model design | Backend Expert |
