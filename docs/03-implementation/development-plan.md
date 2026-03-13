# MyGraduate - 개발 계획

> **Summary**: MyGraduate 웹앱의 구현 우선순위, 스프린트 계획, 컴포넌트 구조 정의
>
> **Project**: MyGraduate
> **Version**: 0.1.0
> **Author**: CTO Lead (개발자1 백엔드 + 개발자2 프론트엔드 통합)
> **Date**: 2026-03-13
> **Status**: Draft
> **Related Docs**:
>   - [product-requirements.md](../01-plan/product-requirements.md)
>   - [system-architecture.md](../02-design/system-architecture.md)
>   - [ui-ux-design.md](../02-design/ui-ux-design.md)
>   - [data-model.md](../02-design/data-model.md)

---

## 1. 개발 전략

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **MVP First** | 최소 기능으로 빠르게 배포, 실제 사용하며 개선 |
| **Vertical Slice** | 한 기능을 DB부터 UI까지 완전히 구현한 후 다음 기능으로 |
| **Ship Early** | 1~2주 내에 사용 가능한 버전 배포 목표 |
| **Iterate** | 매주 실사용 피드백으로 개선 |

### 1.2 Phase 구분

```
Phase 1 (MVP): 핵심 기록 + 조회 + 기본 시각화
  → 목표: 실제 수업에서 사용 가능한 상태
  → 기간: Sprint 1~4 (약 4주)

Phase 2 (Enhancement): AI 요약 + 배지 + 타임캡슐
  → 목표: 동기부여 + 분석 기능 강화
  → 기간: Sprint 5~8 (약 4주)

Phase 3 (Graduation): 졸업 스토리북 + Before/After
  → 목표: 1년 후 최종 결과물 생성
  → 기간: 졸업 2~3개월 전 착수
```

---

## 2. Sprint 계획 (Phase 1 - MVP)

### Sprint 0: 프로젝트 세팅 (Day 1~2)

**목표:** 개발 환경 구축 및 기반 코드 생성

| Task | 상세 | 우선순위 |
|------|------|----------|
| Next.js 프로젝트 생성 | `create-next-app` + TypeScript + App Router + Tailwind | P0 |
| Supabase 프로젝트 연결 | 프로젝트 생성, 환경변수 설정, Client 초기화 | P0 |
| shadcn/ui 설치 | 기본 컴포넌트 설치 (Button, Card, Input, Dialog 등) | P0 |
| DB 마이그레이션 실행 | profiles, subjects, sessions 테이블 생성 | P0 |
| RLS 정책 적용 | 기본 보안 정책 설정 | P0 |
| Auth 설정 | Supabase Auth + Next.js Middleware | P0 |
| 디자인 토큰 설정 | Tailwind 커스텀 테마 (색상, 폰트, 간격) | P1 |
| 레이아웃 컴포넌트 | Sidebar, Header, BottomNav 기본 구조 | P1 |
| Vercel 배포 | GitHub 연동, 자동 배포 파이프라인 | P1 |

**완료 조건:**
- [x] `localhost:3000` 접속 가능
- [x] 로그인/회원가입 동작
- [x] Vercel Preview 배포 확인
- [x] DB 테이블 생성 확인

---

### Sprint 1: 과목 관리 + 수업 기록 (Week 1)

**목표:** 핵심 데이터 입력 기능 완성

#### Backend Tasks (개발자1)

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| subjects CRUD Server Actions | `getSubjects`, `createSubject`, `updateSubject`, `archiveSubject` | 2h |
| sessions CRUD Server Actions | `getSessions`, `getSession`, `createSession`, `updateSession` | 3h |
| Quick Capture Action | `quickCapture` - 간편 메모 생성 | 1h |
| 파일 업로드 | Supabase Storage 연동, 이미지 업로드/조회 | 2h |
| TypeScript 타입 생성 | `supabase gen types typescript` 자동 생성 | 0.5h |

#### Frontend Tasks (개발자2)

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| 과목 관리 페이지 | 과목 목록 + 추가/편집 모달 | 3h |
| Session Logger 폼 | 수업 기록 작성 폼 (전체 필드) | 4h |
| EmotionPicker 컴포넌트 | 4단계 감정 선택 + 강도 슬라이더 | 2h |
| TagInput 컴포넌트 | 키워드 태그 입력/삭제 | 1.5h |
| 수업 기록 목록 페이지 | 과목별 필터링, 날짜순 정렬 | 2h |
| 수업 기록 상세 페이지 | 기록 조회 + 편집 모드 | 2h |
| Quick Capture 모달 | FAB 클릭 → 빠른 메모 입력 → 저장 | 2h |

**완료 조건:**
- [x] 과목 등록/편집/삭제 가능
- [x] 수업 기록 작성 (배운 것, 느낀 것, 감정, 키워드) 가능
- [x] Quick Capture로 빠른 메모 가능
- [x] 기록 목록/상세 조회 가능

---

### Sprint 2: 대시보드 + 회고 (Week 2)

**목표:** 메인 화면과 주간 회고 기능

#### Backend Tasks

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| Dashboard Stats Action | `getDashboardStats` - 통합 통계 조회 | 2h |
| Heatmap Data Action | `getHeatmapData` - Calendar Heatmap 데이터 | 1.5h |
| Reflections CRUD Actions | `getReflections`, `createReflection`, `updateReflection` | 2h |
| Current Week Helper | 현재 주차 계산, 이번 주 수업 조회 | 1h |

#### Frontend Tasks

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| Dashboard 페이지 | 위젯 레이아웃 (이번 주 수업, 최근 기록, 통계 카드) | 4h |
| CalendarHeatmap 컴포넌트 | GitHub 잔디 스타일 히트맵 | 3h |
| Growth Tree 미니 뷰 | Dashboard용 작은 나무 SVG (레벨 표시) | 2h |
| 주간 회고 작성 폼 | summary, top_learnings, 감정 종합, 다짐, 자기 메시지 | 3h |
| 주간 회고 목록 | 주차별 회고 리스트 + 이동 | 1.5h |
| 통계 카드 컴포넌트 | 총 기록, 연속 기록, 성장 지수 카드 | 1h |

**완료 조건:**
- [x] 대시보드에서 전체 현황 한눈에 확인
- [x] Calendar Heatmap 동작
- [x] 주간 회고 작성/조회 가능

---

### Sprint 3: 타임라인 + 성장 시각화 (Week 3)

**목표:** 시간순 조회와 성장 시각화

#### Backend Tasks

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| Timeline Action | `getTimeline` - 세션+회고+성취 통합 타임라인 | 2h |
| Growth Snapshot Logic | 성장 지수 계산 + 스냅샷 저장/갱신 | 3h |
| Keyword Stats Action | `getKeywordStats` - 키워드 빈도/트렌드 | 1.5h |
| Emotion Stats Action | `getEmotionStats` - 감정 통계 | 1h |
| Streak 계산 로직 | 연속 기록 주차 계산 | 1.5h |

#### Frontend Tasks

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| Timeline 페이지 | 월별 그룹핑, 무한 스크롤, 타임라인 UI | 4h |
| Growth Tree 전체 뷰 | 레벨별 나무 SVG + 잎/열매 표현 + 계절 배경 | 6h |
| 성장 통계 차트 | Recharts - 성장 지수 추이 (Area Chart) | 2h |
| 감정 흐름 차트 | Recharts - 감정 변화 (Line Chart) | 2h |
| 키워드 클라우드 | 빈도 기반 Word Cloud (Phase 2에서 고도화) | 2h |

**완료 조건:**
- [x] 타임라인에서 전체 기록을 시간순으로 조회
- [x] Growth Tree가 레벨에 따라 시각적으로 다른 나무 표시
- [x] 기본 통계 차트(성장 지수, 감정 흐름) 동작

---

### Sprint 4: 마감 + 배포 + QA (Week 4)

**목표:** MVP 품질 확보 및 프로덕션 배포

| Task | 상세 | 예상 시간 |
|------|------|-----------|
| 반응형 QA | 모바일/태블릿/데스크탑 전 화면 테스트 | 4h |
| 에러 핸들링 | 네트워크 에러, 빈 상태, 로딩 상태 처리 | 3h |
| Onboarding 플로우 | 첫 사용자 환영 + 과목 등록 가이드 | 3h |
| Empty State UI | 각 페이지 빈 상태 메시지 + 일러스트 | 2h |
| 성능 최적화 | Lighthouse 90+ 목표, 이미지 최적화, Code Splitting | 3h |
| E2E 테스트 | 핵심 플로우 Playwright 테스트 (기록 생성 → 대시보드 확인) | 4h |
| 버그 수정 | QA 과정에서 발견된 버그 수정 | 4h |
| 프로덕션 배포 | Vercel Production + Supabase Production 환경 | 2h |

**완료 조건:**
- [x] Lighthouse Performance >= 90
- [x] 모바일에서 수업 기록 작성이 자연스러움
- [x] E2E 핵심 플로우 테스트 통과
- [x] 프로덕션 배포 완료

---

## 3. 컴포넌트 구조 (Frontend Architecture)

### 3.1 컴포넌트 계층 구조

```
src/components/
│
├── ui/                          # shadcn/ui 기본 컴포넌트 (자동 생성)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   ├── toast.tsx
│   └── ...
│
├── layout/                      # 레이아웃 컴포넌트
│   ├── AppLayout.tsx            # 인증된 사용자의 메인 레이아웃
│   ├── Sidebar.tsx              # Desktop 사이드바
│   ├── Header.tsx               # 페이지 상단 헤더
│   ├── BottomNav.tsx            # Mobile 하단 탭바
│   └── PageContainer.tsx        # 페이지 콘텐츠 래퍼 (max-width, padding)
│
├── common/                      # 도메인 무관 공통 컴포넌트
│   ├── EmotionPicker.tsx        # 감정 온도계 (4감정 + 강도)
│   ├── TagInput.tsx             # 키워드 태그 입력
│   ├── CalendarHeatmap.tsx      # GitHub 잔디 스타일 히트맵
│   ├── StatCard.tsx             # 통계 숫자 카드
│   ├── EmptyState.tsx           # 빈 상태 공통 컴포넌트
│   ├── LoadingSpinner.tsx       # 로딩 스피너
│   ├── FloatingActionButton.tsx # FAB (Quick Capture 트리거)
│   └── ProgressBar.tsx          # 진행률 바
│
├── session/                     # 수업 기록 관련
│   ├── SessionForm.tsx          # 수업 기록 작성/편집 폼
│   ├── SessionCard.tsx          # 기록 목록의 카드 아이템
│   ├── SessionDetail.tsx        # 기록 상세 보기
│   ├── SessionList.tsx          # 기록 목록 (필터링 포함)
│   └── QuickCaptureModal.tsx    # 빠른 메모 모달
│
├── reflection/                  # 회고 관련
│   ├── ReflectionForm.tsx       # 주간 회고 작성 폼
│   ├── ReflectionCard.tsx       # 회고 목록 카드
│   └── ReflectionDetail.tsx     # 회고 상세
│
├── growth/                      # 성장 시각화 관련
│   ├── GrowthTree.tsx           # 성장 나무 SVG (레벨별)
│   ├── GrowthTreeMini.tsx       # 대시보드용 미니 나무
│   ├── GrowthIndexChart.tsx     # 성장 지수 추이 차트
│   ├── EmotionFlowChart.tsx     # 감정 흐름 차트
│   ├── SubjectRadarChart.tsx    # 과목별 레이더 차트
│   └── KeywordCloud.tsx         # 키워드 클라우드
│
├── timeline/                    # 타임라인 관련
│   ├── TimelineView.tsx         # 타임라인 메인 뷰
│   ├── TimelineEntry.tsx        # 타임라인 개별 항목
│   └── TimelineFilter.tsx       # 월별/타입별 필터
│
├── subject/                     # 과목 관련
│   ├── SubjectList.tsx          # 과목 목록
│   ├── SubjectForm.tsx          # 과목 추가/편집 모달
│   └── SubjectBadge.tsx         # 과목 색상 배지
│
├── dashboard/                   # 대시보드 관련
│   ├── WeekStatusCard.tsx       # 이번 주 수업 상태
│   ├── RecentFeed.tsx           # 최근 기록 피드
│   ├── StatsRow.tsx             # 통계 카드 행
│   └── WelcomeMessage.tsx       # 환영 메시지 (동적)
│
└── onboarding/                  # 온보딩 관련
    ├── OnboardingWizard.tsx     # 온보딩 스텝 위저드
    ├── SemesterSetup.tsx        # 학기 정보 입력
    ├── SubjectSetup.tsx         # 과목 등록
    └── FirstTreePlanting.tsx    # 첫 나무 심기 애니메이션
```

### 3.2 Feature 모듈 구조

```
src/features/
│
├── sessions/
│   ├── hooks/
│   │   ├── useSessions.ts       # TanStack Query - 세션 목록 조회
│   │   ├── useSession.ts        # TanStack Query - 세션 상세
│   │   ├── useCreateSession.ts  # TanStack Mutation - 생성
│   │   ├── useUpdateSession.ts  # TanStack Mutation - 수정
│   │   └── useQuickCapture.ts   # TanStack Mutation - Quick Capture
│   ├── actions/
│   │   └── session-actions.ts   # Next.js Server Actions
│   └── utils/
│       ├── session-validator.ts # 입력 유효성 검사
│       └── session-helpers.ts   # 헬퍼 함수
│
├── reflections/
│   ├── hooks/
│   │   ├── useReflections.ts
│   │   ├── useCreateReflection.ts
│   │   └── useCurrentWeek.ts
│   ├── actions/
│   │   └── reflection-actions.ts
│   └── utils/
│       └── week-calculator.ts   # 주차 계산 유틸리티
│
├── subjects/
│   ├── hooks/
│   │   ├── useSubjects.ts
│   │   └── useCreateSubject.ts
│   └── actions/
│       └── subject-actions.ts
│
├── growth/
│   ├── hooks/
│   │   ├── useGrowthStats.ts
│   │   ├── useHeatmapData.ts
│   │   ├── useKeywordStats.ts
│   │   └── useEmotionStats.ts
│   ├── actions/
│   │   └── growth-actions.ts
│   └── utils/
│       ├── growth-calculator.ts # 성장 지수 계산
│       └── tree-level.ts        # Tree Level 매핑
│
└── timeline/
    ├── hooks/
    │   └── useTimeline.ts
    └── actions/
        └── timeline-actions.ts
```

### 3.3 Zustand Store 구조

```typescript
// stores/ui-store.ts
interface UIStore {
  // 사이드바
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Quick Capture 모달
  quickCaptureOpen: boolean;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;

  // 테마
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// stores/session-store.ts
interface SessionStore {
  // 세션 폼의 임시 저장 (Draft)
  draftSession: Partial<SessionInput> | null;
  saveDraft: (data: Partial<SessionInput>) => void;
  clearDraft: () => void;

  // 필터 상태
  filter: {
    subjectId: string | null;
    dateRange: { from: string; to: string } | null;
    status: SessionStatus | null;
  };
  setFilter: (filter: Partial<SessionStore['filter']>) => void;
  resetFilter: () => void;
}
```

### 3.4 TanStack Query 설정

```typescript
// lib/query-client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5분
      gcTime: 1000 * 60 * 30,       // 30분
      retry: 2,
      refetchOnWindowFocus: false,   // 개인 앱이므로 불필요
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Query Key 컨벤션:**

```typescript
const queryKeys = {
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filter: SessionFilter) => [...queryKeys.sessions.lists(), filter] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
  },
  reflections: {
    all: ['reflections'] as const,
    lists: () => [...queryKeys.reflections.all, 'list'] as const,
    list: (year?: number) => [...queryKeys.reflections.lists(), { year }] as const,
    currentWeek: () => [...queryKeys.reflections.all, 'currentWeek'] as const,
  },
  growth: {
    dashboard: () => ['growth', 'dashboard'] as const,
    heatmap: (year?: number) => ['growth', 'heatmap', { year }] as const,
    snapshots: (range?: DateRange) => ['growth', 'snapshots', range] as const,
    keywords: () => ['growth', 'keywords'] as const,
    emotions: (range?: DateRange) => ['growth', 'emotions', range] as const,
  },
  timeline: {
    all: ['timeline'] as const,
    list: (filter: TimelineFilter) => ['timeline', 'list', filter] as const,
  },
  subjects: {
    all: ['subjects'] as const,
  },
};
```

---

## 4. 구현 우선순위 매트릭스

### 4.1 기능별 우선순위

```
          높은 영향 (Impact)
              │
   P1         │         P0
   ─────────────────────────
   Monthly    │  Session Logger
   Report     │  Dashboard
   Knowledge  │  Quick Capture
   Map        │  Weekly Reflection
              │  Growth Tree
              │  Timeline
              │  Subjects CRUD
              │  Calendar Heatmap
   ─────────────────────────
   P2         │         P1
   ─────────────────────────
   Before &   │  AI Summary
   After      │  Achievement Badges
   Time       │  Mood Tracker
   Capsule    │  Streak Counter
              │
          낮은 노력 ──────────── 높은 노력
```

### 4.2 의존성 그래프

```
[Auth + DB Setup]
       │
       ├── [Subjects CRUD] ──────────────────────────┐
       │                                              │
       ├── [Session Logger] ◄─────────────────────────┘
       │        │
       │        ├── [Quick Capture]
       │        │
       │        ├── [Session List/Detail]
       │        │        │
       │        │        └── [Timeline] ◄── [Reflection]
       │        │
       │        └── [Dashboard] ◄── [Calendar Heatmap]
       │                 │
       │                 └── [Growth Tree] ◄── [Growth Index Calc]
       │                          │
       │                          └── [Statistics Charts]
       │
       └── [Onboarding Flow]
```

---

## 5. 기술 구현 가이드

### 5.1 Server Actions 패턴

```typescript
// features/sessions/actions/session-actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSession(input: SessionInput) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      ...input,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/sessions');

  return data;
}
```

### 5.2 TanStack Query Hook 패턴

```typescript
// features/sessions/hooks/useCreateSession.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession } from '../actions/session-actions';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.growth.dashboard() });
      toast.success('오늘의 한 걸음이 기록되었어요!');
    },
    onError: (error) => {
      toast.error('기록 저장에 실패했어요. 다시 시도해주세요.');
      console.error('Failed to create session:', error);
    },
  });
}
```

### 5.3 Growth Tree SVG 구현 방향

```typescript
// components/growth/GrowthTree.tsx
interface GrowthTreeProps {
  level: number;        // 1~10
  season: Season;
  leafCount: number;
  fruitCount: number;
  animated?: boolean;
}

// SVG 접근 방식:
// 1. 레벨별 나무 형태를 SVG path로 정의 (10단계)
// 2. 잎사귀: 랜덤 위치에 배치, 키워드 수에 비례
// 3. 열매: 가지 끝에 배치, 과제 완료 수에 비례
// 4. 계절에 따른 색상 팔레트 변경
// 5. Framer Motion으로 성장 애니메이션

// 단계별 나무 SVG:
// Level 1: 씨앗 아이콘
// Level 2-3: 작은 새싹/어린 나무
// Level 4-5: 중간 크기 나무
// Level 6-7: 큰 나무 + 꽃/열매
// Level 8-9: 웅장한 나무
// Level 10: 세계수 + 졸업 모자
```

---

## 6. 테스트 전략

### 6.1 테스트 범위

| 레이어 | 도구 | 대상 | 커버리지 목표 |
|--------|------|------|-------------|
| Unit | Vitest | 유틸리티 함수 (growth-calculator, week-calculator) | 90%+ |
| Component | Vitest + Testing Library | EmotionPicker, TagInput, SessionForm | 80%+ |
| Integration | Vitest | Server Actions + Supabase | 70%+ |
| E2E | Playwright | 핵심 사용자 플로우 | 핵심 5개 플로우 |

### 6.2 핵심 E2E 테스트 시나리오

```
1. 회원가입 → 온보딩 → 과목 등록 → 대시보드 확인
2. 수업 기록 작성 (전체 필드) → 목록 확인 → 상세 확인
3. Quick Capture → 기록 확인
4. 주간 회고 작성 → 대시보드 업데이트 확인
5. 타임라인 조회 → 월별 필터링 → 항목 클릭
```

---

## 7. 환경 변수 목록

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...    # Server-side only

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MyGraduate

# Analytics (Phase 2)
# NEXT_PUBLIC_ANALYTICS_ID=
```

---

## 8. 패키지 의존성

### 8.1 핵심 의존성

```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "typescript": "^5.4",
    "@supabase/supabase-js": "^2.43",
    "@supabase/ssr": "^0.3",
    "@tanstack/react-query": "^5.40",
    "zustand": "^4.5",
    "recharts": "^2.12",
    "framer-motion": "^11.2",
    "tailwindcss": "^3.4",
    "class-variance-authority": "^0.7",
    "clsx": "^2.1",
    "tailwind-merge": "^2.3",
    "lucide-react": "^0.379",
    "sonner": "^1.5",
    "date-fns": "^3.6",
    "zod": "^3.23"
  },
  "devDependencies": {
    "@types/react": "^18.3",
    "@types/node": "^20",
    "vitest": "^1.6",
    "@testing-library/react": "^15.0",
    "@playwright/test": "^1.44",
    "eslint": "^8.57",
    "eslint-config-next": "^14.2",
    "prettier": "^3.2",
    "prettier-plugin-tailwindcss": "^0.5",
    "supabase": "^1.167"
  }
}
```

---

## 9. 배포 체크리스트

### 9.1 첫 배포 전 체크리스트

- [ ] Supabase Production 프로젝트 생성
- [ ] 환경변수 Vercel에 등록
- [ ] RLS 정책 Production DB에 적용
- [ ] Auth 리디렉트 URL 설정 (프로덕션 도메인)
- [ ] Storage CORS 설정
- [ ] 도메인 연결 (선택: mygraduate.vercel.app 또는 커스텀)
- [ ] Lighthouse 성능 체크 (>= 90)
- [ ] 모바일 브라우저 테스트 (iOS Safari, Chrome)

### 9.2 주간 운영 루틴

```
매주 금요일 수업 전:
  - 앱 접속 확인
  - Quick Capture 동작 확인
  - 이전 기록 데이터 확인

매월 1일:
  - Supabase 사용량 확인
  - 에러 로그 확인
  - 성능 지표 확인
```

---

## 10. Phase 2, 3 로드맵 (요약)

### Phase 2: Enhancement (Sprint 5~8)

| Sprint | 주요 기능 |
|--------|-----------|
| Sprint 5 | Achievement Badges 시스템 + 배지 알림 UI |
| Sprint 6 | AI 학습 요약 (OpenAI API via Edge Function) |
| Sprint 7 | Monthly Report 자동 생성 + Time Capsule |
| Sprint 8 | Before & After 자가진단 + Mood Tracker 고도화 |

### Phase 3: Graduation (졸업 2~3개월 전)

| Sprint | 주요 기능 |
|--------|-----------|
| Sprint 9 | 졸업 스토리북 데이터 수집 + 챕터 자동 구성 |
| Sprint 10 | 스토리북 웹 뷰 + PDF Export |
| Sprint 11 | 1년 종합 통계 + Knowledge Map |
| Sprint 12 | 최종 QA + 졸업 스토리북 완성 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial development plan | CTO Lead |
