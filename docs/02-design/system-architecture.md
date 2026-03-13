# MyGraduate - 시스템 아키텍처 설계

> **Summary**: MyGraduate 웹앱의 기술 스택, 시스템 구조, 인프라 아키텍처 정의
>
> **Project**: MyGraduate
> **Version**: 0.1.0
> **Author**: Enterprise Expert (아키텍처 담당)
> **Date**: 2026-03-13
> **Status**: Draft
> **Planning Doc**: [product-requirements.md](../01-plan/product-requirements.md)

---

## 1. 아키텍처 개요

### 1.1 설계 원칙

- **Simple First**: 1인 개발자가 유지보수 가능한 수준의 복잡도
- **Data Safety**: 1년치 학습 기록은 절대 유실되면 안 되는 자산
- **Progressive Enhancement**: MVP에서 시작하여 점진적으로 기능 추가
- **Mobile-First**: 수업 중 스마트폰으로도 빠르게 기록 가능

### 1.2 시스템 레벨

```
Project Level: Dynamic
─────────────────────────────────────────
  개인 프로젝트이지만 인증/데이터 저장 필요
  BaaS(Supabase) 활용으로 백엔드 최소화
  Next.js App Router로 풀스택 구현
```

---

## 2. 기술 스택

### 2.1 선정 기술 스택

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                              │
│  Next.js 14+ (App Router) + TypeScript                  │
│  Tailwind CSS + shadcn/ui                               │
│  Server Components + Server Actions (Data Fetching)     │
│  Recharts (Charts) + Custom SVG (Growth Tree)           │
│  Framer Motion (Animations)                             │
├─────────────────────────────────────────────────────────┤
│                    Backend (BaaS)                        │
│  Supabase                                               │
│  - PostgreSQL (Database)                                │
│  - Auth (Authentication)                                │
│  - Storage (File/Image Upload)                          │
│  - Edge Functions (Custom Logic)                        │
│  - Realtime (Optional)                                  │
├─────────────────────────────────────────────────────────┤
│                    Infrastructure                        │
│  Vercel (Hosting + CDN + Edge)                          │
│  Supabase Cloud (Database + Auth + Storage)             │
│  GitHub (Source Code + CI/CD)                           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 기술 선택 근거

| 기술 | 선택 이유 | 대안 대비 장점 |
|------|----------|---------------|
| **Next.js 14+** | App Router의 Server Components, SSR/SSG 혼합 | Remix 대비 생태계 크기, SvelteKit 대비 취업 시장 |
| **TypeScript** | 타입 안전성, IDE 지원, 리팩토링 용이 | 개인 프로젝트여도 1년 유지보수 필수 |
| **Supabase** | PostgreSQL 기반, Auth/Storage 내장, 무료 티어 충분 | Firebase 대비 SQL 쿼리 가능, 데이터 이식성 |
| **Tailwind + shadcn/ui** | 빠른 UI 개발, 커스터마이징 자유도 | MUI 대비 번들 크기 작음, 디자인 자유도 높음 |
| **Server Actions** | Next.js 내장, 별도 API 레이어 불필요 | 단일 개발자 프로젝트에 최적화, Zustand/TanStack Query 불필요 |
| **Recharts** | React 네이티브, 선언적 API | D3 대비 학습 비용 낮음, 충분한 차트 종류 |
| **Vercel** | Next.js 최적화, 자동 배포, 글로벌 CDN | Netlify 대비 Next.js 지원 완벽 |

---

## 3. 시스템 아키텍처

### 3.1 전체 아키텍처 다이어그램

```
                           ┌──────────────────┐
                           │   사용자 (브라우저) │
                           │  Mobile / Desktop │
                           └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │    Vercel CDN     │
                           │  (Edge Network)   │
                           └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │ Static Pages │ │  SSR Pages   │ │  API Routes  │
           │  (SSG/ISR)   │ │ (Dynamic)    │ │  (Next.js)   │
           │  - Landing   │ │ - Dashboard  │ │  - Mutations │
           │  - About     │ │ - Timeline   │ │  - Custom    │
           └──────────────┘ └──────────────┘ └──────┬───────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │    Supabase      │
                                            │  ┌────────────┐  │
                                            │  │    Auth     │  │
                                            │  ├────────────┤  │
                                            │  │ PostgreSQL  │  │
                                            │  ├────────────┤  │
                                            │  │  Storage    │  │
                                            │  ├────────────┤  │
                                            │  │Edge Funcs   │  │
                                            │  └────────────┘  │
                                            └──────────────────┘
```

### 3.2 데이터 흐름

```
[수업 기록 작성]
User → Next.js Client Component (Form)
     → Server Action (createSession / updateSession)
     → Supabase Server Client
     → PostgreSQL (저장)
     → revalidatePath() → 자동 재렌더링
     → UI 업데이트

[대시보드 조회]
User → Next.js Server Component (SSR)
     → Server Action / Supabase Server Client
     → PostgreSQL (조회)
     → React Server Component 렌더링
     → 클라이언트 Hydration
     → Recharts/Custom SVG 시각화

Note: TanStack Query와 Zustand는 패키지에 포함되어 있으나
      Server Components + Server Actions 패턴으로 충분하여 미사용.
      단일 개발자 프로젝트의 단순화 결정 (의도적 생략).
```

### 3.4 모바일 PWA 전략

```
모바일 사용 시나리오: 수업 중 스마트폰으로 빠른 기록
─────────────────────────────────────────────────────
  목표: 5초 이내 Quick Capture 완료
  대비: 수업 중 WiFi/LTE 불안정 환경
  접근: PWA (Progressive Web App) 로 네이티브 앱 수준 경험
```

| 기술 | 용도 | 구현 |
|------|------|------|
| **Service Worker** | 오프라인 캐싱, 백그라운드 동기화 | `next-pwa` 또는 커스텀 `sw.js` |
| **IndexedDB** | 오프라인 임시 저장 → 온라인 복귀 시 자동 Supabase 동기화 | `idb` 라이브러리 |
| **Web App Manifest** | 홈 화면 추가, 스플래시 스크린, 앱 아이콘 | `public/manifest.json` |
| **Screen Wake Lock API** | 수업 중 화면 꺼짐 방지 옵션 | `navigator.wakeLock.request('screen')` |
| **Web Speech API** | Quick Capture 음성 입력 | `SpeechRecognition` (미지원 시 버튼 숨김) |
| **Web Share API** | 기록 공유 (Phase 2) | `navigator.share()` |

**오프라인 → 온라인 동기화 흐름:**
```
[오프라인 Quick Capture]
User → Input 입력 → IndexedDB 임시 저장 → UI 즉시 반영

[온라인 복귀 시]
Service Worker (Background Sync)
     → IndexedDB에서 미동기 데이터 조회
     → Supabase Server Action 호출
     → PostgreSQL 저장
     → IndexedDB 임시 데이터 삭제
     → UI revalidatePath() 갱신
```

---

### 3.3 인증 흐름

```
[로그인]
User → Supabase Auth (Email/Password or OAuth)
     → JWT Token 발급
     → Next.js Middleware (세션 검증)
     → 인증된 페이지 접근

[세션 관리]
Supabase Auth → httpOnly Cookie (자동 관리)
Next.js Middleware → 매 요청 시 토큰 검증
Token Refresh → Supabase SDK 자동 처리
```

---

## 4. 프로젝트 구조

### 4.1 폴더 구조 (Dynamic Level)

```
MyGraduate/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 인증 관련 라우트 그룹
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (main)/                   # 인증 필요한 라우트 그룹
│   │   │   ├── dashboard/page.tsx    # 메인 대시보드
│   │   │   ├── sessions/             # 수업 기록
│   │   │   │   ├── page.tsx          # 목록
│   │   │   │   ├── new/page.tsx      # 새 기록
│   │   │   │   └── [id]/page.tsx     # 상세/편집
│   │   │   ├── timeline/page.tsx     # 타임라인 뷰
│   │   │   ├── reflection/           # 회고
│   │   │   │   ├── page.tsx          # 주간 회고 목록
│   │   │   │   └── new/page.tsx      # 새 회고
│   │   │   ├── subjects/page.tsx     # 과목 관리
│   │   │   ├── growth/page.tsx       # 성장 시각화 (Tree + Charts)
│   │   │   ├── storybook/page.tsx    # 졸업 스토리북
│   │   │   └── settings/page.tsx     # 설정
│   │   ├── api/                      # API Routes (필요 시)
│   │   ├── layout.tsx                # Root Layout
│   │   ├── page.tsx                  # Landing Page
│   │   └── globals.css
│   │
│   ├── components/                   # 공통 컴포넌트
│   │   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── layout/                   # 레이아웃 컴포넌트
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── BottomNav.tsx         # 모바일 하단 네비게이션
│   │   ├── session/                  # 수업 기록 관련
│   │   ├── reflection/               # 회고 관련
│   │   ├── growth/                   # 성장 시각화 관련
│   │   │   ├── GrowthTree.tsx        # 나무 성장 SVG
│   │   │   ├── KnowledgeMap.tsx      # 지식 네트워크
│   │   │   └── MoodChart.tsx         # 감정 흐름
│   │   └── common/                   # 공통 UI
│   │       ├── EmotionPicker.tsx     # 감정 온도계
│   │       ├── TagInput.tsx          # 키워드 태그
│   │       └── CalendarHeatmap.tsx   # 잔디 히트맵
│   │
│   ├── features/                     # Feature 모듈
│   │   ├── sessions/                 # 수업 기록 Feature
│   │   │   ├── hooks/
│   │   │   ├── actions/              # Server Actions
│   │   │   └── utils/
│   │   ├── reflections/              # 회고 Feature
│   │   ├── subjects/                 # 과목 Feature
│   │   ├── growth/                   # 성장 시각화 Feature
│   │   └── storybook/               # 졸업 스토리북 Feature
│   │
│   ├── lib/                          # 라이브러리/유틸리티
│   │   ├── offline/
│   │   │   ├── cache.ts              # IndexedDB 오프라인 캐시 관리
│   │   │   └── sync.ts               # 오프라인→온라인 동기화 로직
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저 클라이언트
│   │   │   ├── server.ts             # 서버 클라이언트
│   │   │   └── middleware.ts         # Auth 미들웨어
│   │   ├── utils/
│   │   │   ├── date.ts               # 날짜 유틸리티
│   │   │   ├── growth-calculator.ts  # 성장 지수 계산
│   │   │   └── storybook-generator.ts # 스토리북 생성
│   │   └── constants.ts              # 상수 정의
│   │
│   ├── stores/                       # Zustand 상태 저장소
│   │   ├── session-store.ts
│   │   └── ui-store.ts
│   │
│   └── types/                        # TypeScript 타입 정의
│       ├── database.types.ts         # Supabase 자동 생성 타입
│       ├── session.ts
│       ├── reflection.ts
│       ├── subject.ts
│       └── growth.ts
│
├── public/
│   ├── manifest.json                 # PWA 매니페스트
│   ├── sw.js                         # Service Worker (next-pwa 자동 생성)
│   ├── images/
│   └── icons/
│       ├── icon-192.png              # PWA 아이콘 (192×192)
│       └── icon-512.png              # PWA 아이콘 (512×512)
│
├── supabase/
│   ├── migrations/                   # DB 마이그레이션
│   └── seed.sql                      # 초기 데이터
│
├── docs/                             # PDCA 문서
├── tests/                            # 테스트
│   ├── unit/
│   └── e2e/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local                        # 환경변수 (gitignore)
```

---

## 5. 확장성 고려

### 5.1 Phase별 아키텍처 확장 계획

| Phase | 추가 기술 | 아키텍처 변경 |
|-------|----------|---------------|
| **Phase 1 (MVP)** | 기본 스택 | 없음 (현재 설계 그대로) |
| **Phase 2** | OpenAI API (AI 요약) | Edge Function에 AI 호출 추가 |
| **Phase 3** | html2canvas / jsPDF (스토리북) | 클라이언트 사이드 PDF 생성 |
| **Future** | PWA (오프라인 지원) | Service Worker + IndexedDB 캐시 |

### 5.2 데이터 확장성

```
현재 규모 추정:
- 사용자: 1명
- 수업 기록: ~104건 (52주 x 2회)
- 회고: ~52건 (주간)
- 사진/파일: ~200개 (선택적)

Supabase 무료 티어 충분:
- Database: 500MB (예상 사용 < 50MB)
- Storage: 1GB (예상 사용 < 500MB)
- Auth: 50,000 MAU (1명 사용)
- Edge Functions: 500,000 호출/월
```

### 5.3 성능 최적화 전략

| 전략 | 적용 대상 | 구현 방법 |
|------|----------|-----------|
| SSG | Landing, About | `generateStaticParams()` |
| SSR | Dashboard, Timeline | Server Components |
| ISR | Monthly Report | `revalidate: 3600` |
| Server Cache | 수업 기록 목록 | Next.js `revalidatePath()` / `revalidateTag()` |
| Image Optimization | 첨부 사진 | Next.js `<Image>` + Supabase Transform |
| Code Splitting | 시각화 컴포넌트 | `dynamic()` import |
| Lazy Loading | 차트, Growth Tree | Intersection Observer |
| **Touch Response** | 모든 인터랙션 | 100ms 이내 피드백, CSS transform 활용 |
| **Offline Cache** | Quick Capture | Service Worker + IndexedDB |
| **Mobile Bundle** | 모바일 우선 | 시각화 컴포넌트 지연 로딩 강화 |
| **Upload Resize** | 모바일 첨부 사진 | 업로드 전 WebP 변환 + 리사이징 (canvas API) |
| **Viewport** | 모바일 전체 | `width=device-width, initial-scale=1, viewport-fit=cover` |

---

## 6. 보안 고려사항

| 영역 | 조치 | 구현 |
|------|------|------|
| 인증 | Supabase Auth (JWT) | 자동 관리 |
| 인가 | Row Level Security (RLS) | Supabase Policy |
| 데이터 전송 | HTTPS 강제 | Vercel 자동 적용 |
| 환경변수 | `.env.local` (gitignore) | Vercel Environment Variables |
| SQL Injection | Supabase SDK 파라미터 바인딩 | SDK 기본 동작 |
| XSS | React 자동 이스케이프 + CSP | Next.js 설정 |
| CSRF | SameSite Cookie | Supabase Auth 기본 설정 |

### 6.1 RLS Policy 예시

```sql
-- 사용자는 자기 데이터만 접근 가능
CREATE POLICY "Users can only access own sessions"
  ON sessions FOR ALL
  USING (auth.uid() = user_id);
```

---

## 7. 개발 환경 및 도구

| 도구 | 용도 | 설정 |
|------|------|------|
| pnpm | 패키지 매니저 | `pnpm-workspace.yaml` (필요 시) |
| ESLint | 코드 린팅 | `next/core-web-vitals` + custom |
| Prettier | 코드 포맷팅 | `.prettierrc` |
| Husky | Git Hooks | pre-commit lint |
| lint-staged | Staged 파일만 lint | `.lintstagedrc` |
| TypeScript | 타입 체크 | `strict: true` |
| Supabase CLI | 로컬 개발 | `supabase start` |

---

## 8. 배포 전략

```
개발 흐름:
  Local Dev (supabase start + next dev)
       │
       ▼
  GitHub Push (feature branch)
       │
       ▼
  Vercel Preview Deployment (자동)
       │
       ▼
  PR Merge to main
       │
       ▼
  Vercel Production Deployment (자동)
```

| 환경 | URL | Database | 용도 |
|------|-----|----------|------|
| Local | localhost:3000 | Supabase Local | 개발 |
| Preview | *.vercel.app | Supabase Staging | PR 리뷰 |
| Production | mygraduate.vercel.app | Supabase Production | 실 사용 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial architecture design | Enterprise Expert |
| 0.2 | 2026-03-13 | 실제 구현 반영: Server Actions 패턴으로 TanStack Query / Zustand 대체, Sidebar 추가, CalendarHeatmap 추가 | PDCA Iterator Agent |
| 0.3 | 2026-03-13 | 모바일 PWA 전략 추가 (Section 3.4): Service Worker, IndexedDB 오프라인 동기화, Screen Wake Lock, Web Speech API; 폴더 구조에 `offline/` 모듈 및 PWA 아이콘 추가; 성능 최적화에 모바일 항목 5개 추가 | Frontend Architect |
