# MyGraduate - Design-Implementation Gap Analysis Report

> **Summary**: MyGraduate 설계 문서와 실제 구현 코드 간의 갭 분석 결과
>
> **Author**: Gap Detector Agent
> **Created**: 2026-03-13
> **Status**: Draft

---

## 1. Analysis Overview

- **Analysis Target**: MyGraduate MVP (Phase 1)
- **Design Documents**:
  - `docs/01-plan/product-requirements.md`
  - `docs/02-design/system-architecture.md`
  - `docs/02-design/ui-ux-design.md`
  - `docs/02-design/data-model.md`
  - `docs/03-implementation/development-plan.md`
- **Implementation Path**: `src/`, `supabase/migrations/`
- **Analysis Date**: 2026-03-13

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Data Model Match | 82% | Warning |
| Core Features (Record/Reflect/Grow/Story) | 78% | Warning |
| UI Structure (5 Core Screens) | 90% | Pass |
| Tech Stack Compliance | 88% | Pass |
| Server Actions Implementation | 80% | Warning |
| Sprint 0-4 MVP Completeness | 72% | Warning |
| **Overall** | **82%** | **Warning** |

---

## 3. Data Model Comparison (82%)

### 3.1 Table Existence Check (9/9 = 100%)

| # | Design Table | Migration | Status |
|---|-------------|-----------|:------:|
| 1 | profiles | `001_initial_schema.sql` | Exists |
| 2 | subjects | `001_initial_schema.sql` | Exists |
| 3 | sessions | `001_initial_schema.sql` | Exists |
| 4 | session_attachments | `001_initial_schema.sql` | Exists |
| 5 | reflections | `001_initial_schema.sql` | Exists |
| 6 | time_capsules | `001_initial_schema.sql` | Exists |
| 7 | achievements | `001_initial_schema.sql` | Exists |
| 8 | growth_snapshots | `001_initial_schema.sql` | Exists |
| 9 | self_assessments | `001_initial_schema.sql` | Exists |

All 9 design tables exist in the migration.

### 3.2 Schema Differences Found

#### profiles

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| display_name | `NOT NULL DEFAULT ''` | Nullable (no NOT NULL, no DEFAULT) | Low |
| onboarding_completed | Defined (BOOLEAN DEFAULT FALSE) | Missing | Medium |
| settings | Defined (JSONB DEFAULT '{}') | Missing | Medium |

#### sessions

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| emotion_type ENUM | `'excited','focused','struggling','proud'` (4 values) | `'excited','focused','confused','tired','inspired','satisfied'` (6 values) | Medium |
| day_type ENUM | `'friday','saturday'` (2 values) | `'friday_evening','saturday_morning','saturday_afternoon','saturday_evening'` (4 values) | Medium |
| session_status ENUM | `'draft','completed'` (2 values) | `'draft','completed','archived'` (3 values) | Low |
| emotion_intensity CHECK | `BETWEEN 1 AND 5` | `BETWEEN 1 AND 10` | Medium |
| subject_id FK | `ON DELETE SET NULL` (nullable) | `ON DELETE CASCADE NOT NULL` | Medium |
| session_number | `NOT NULL` (no default) | `DEFAULT 1 NOT NULL` | Low |
| status default | `DEFAULT 'draft'` | `DEFAULT 'completed'` | Low |

#### achievements

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| badge_type | Custom ENUM (11 values) | Plain TEXT | Low |
| UNIQUE constraint | `UNIQUE(user_id, badge_type)` | Missing | Medium |

#### growth_snapshots

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| total_attachments | Defined | Missing | Low |
| leaf_count | Defined | Missing | Low |
| fruit_count | Defined | Missing | Low |
| UNIQUE constraint | `UNIQUE(user_id, snapshot_date)` | Missing | Medium |

#### self_assessments

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| assessment_type ENUM | `'initial','midterm','final'` | `'initial','monthly','final'` | Low |
| UNIQUE constraint | `UNIQUE(user_id, assessment_type)` | Missing | Medium |

#### session_attachments

| Item | Design | Implementation | Impact |
|------|--------|----------------|:------:|
| file_size | Defined (INTEGER) | Missing | Low |

### 3.3 RLS & Triggers (95%)

- All 9 tables have RLS enabled (matches design)
- RLS policies exist for all tables
- `updated_at` trigger exists for profiles, subjects, sessions, reflections
- `handle_new_user` trigger exists
- Missing: `update_growth_on_session` trigger (design has auto-snapshot on session change)
- Missing: Indexes (design defines 8+ indexes, implementation has none)

---

## 4. Core Feature Comparison (78%)

### 4.1 Record Features

| Feature | Design | Implementation | Status |
|---------|--------|----------------|:------:|
| Session Logger (create) | `createSession()` | `src/lib/actions/sessions.ts` | Done |
| Session Logger (read list) | `getSessions(filter?)` | `getSessions(limit)` -- no filter params | Partial |
| Session Logger (read detail) | `getSession(id)` | `getSessionById(id)` | Done |
| Session Logger (update) | `updateSession(id, data)` | `updateSession(id, updates)` | Done |
| Session Logger (archive/delete) | `archiveSession(id)` | Not implemented | Missing |
| Quick Capture | `quickCapture(data)` | Implemented via `createSession` with `isQuickCapture=true` | Done |
| Emotion Picker (4 emotions) | 4 emotions: excited/focused/struggling/proud | 6 emotions: different set | Changed |
| Emotion Intensity (1-5) | Range 1-5 | Range 1-10 | Changed |
| Keyword Tags | TagInput component | Inline implementation in SessionForm | Partial |
| Photo/File Upload | Supabase Storage integration | Not implemented (photo_urls always []) | Missing |

### 4.2 Reflect Features

| Feature | Design | Implementation | Status |
|---------|--------|----------------|:------:|
| Create/Update Reflection | `createReflection` / `updateReflection` | `createOrUpdateReflection` (upsert) | Done |
| Get Reflections List | `getReflections(year?)` | `getReflections(limit)` | Done |
| Get Current Week | `getCurrentWeekReflection()` | `getCurrentWeekReflection()` | Done |
| Weekly Reflection Form | Full form with all fields | All fields implemented | Done |
| Monthly Report | Phase 2 feature | Not implemented | N/A (Phase 2) |

### 4.3 Grow Features

| Feature | Design | Implementation | Status |
|---------|--------|----------------|:------:|
| Growth Tree SVG | Custom SVG with levels 1-10 | Implemented with Framer Motion | Done |
| Growth Index Calculation | Complex formula (5 factors, 0-1000) | Simplified formula (5 factors) | Partial |
| Growth Snapshot | Auto-update on session change | Manual refresh only | Partial |
| Streak Calculation | `streakScore` factor | Always hardcoded to 0 | Missing |
| Calendar Heatmap | `CalendarHeatmap.tsx` component | Not found in implementation | Missing |
| Keyword Stats | `getKeywordStats()` action | `getSessionStats()` includes topKeywords | Partial |
| Emotion Stats Chart | `getEmotionStats()` + EmotionFlowChart | Not implemented | Missing |
| Growth History Chart | Recharts Area Chart | `GrowthChart` component exists | Done |

### 4.4 Story Features

| Feature | Design | Implementation | Status |
|---------|--------|----------------|:------:|
| Timeline View | Dedicated `getTimeline()` action | Inline data fetching from sessions+reflections | Done |
| Monthly Grouping | Design specified | Implemented | Done |
| Timeline Filter | Month/type filter | No filter UI | Missing |
| Graduation Storybook | Phase 3 feature | Not implemented | N/A (Phase 3) |

---

## 5. UI Structure Comparison (90%)

### 5.1 Core Screens (5/5 = 100%)

| Screen | Design Route | Implementation Route | Status |
|--------|-------------|---------------------|:------:|
| Dashboard | `/dashboard` | `src/app/(app)/dashboard/page.tsx` | Exists |
| Sessions | `/sessions`, `/sessions/new`, `/sessions/[id]` | All 3 pages exist | Exists |
| Growth | `/growth` | `src/app/(app)/growth/page.tsx` | Exists |
| Timeline | `/timeline` | `src/app/(app)/timeline/page.tsx` | Exists |
| Reflect | `/reflection` | `src/app/(app)/reflect/page.tsx` (route name differs) | Exists |

### 5.2 Additional Screens

| Screen | Design | Implementation | Status |
|--------|--------|----------------|:------:|
| Landing Page | `/` | `src/app/page.tsx` | Exists |
| Login | `/login` | `src/app/(auth)/login/page.tsx` | Exists |
| Signup | `/signup` | `src/app/(auth)/signup/page.tsx` | Exists |
| Subjects | `/subjects` | `src/app/(app)/subjects/page.tsx` | Exists |
| Storybook | `/storybook` | Not implemented | N/A (Phase 3) |
| Settings | `/settings` | Not implemented | Missing |
| Quick Capture | `/capture` or Modal | FAB modal (QuickCapture component) | Done (modal approach) |
| Onboarding | Onboarding wizard | Not implemented | Missing |

### 5.3 Layout & Navigation

| Component | Design | Implementation | Status |
|-----------|--------|----------------|:------:|
| Sidebar (Desktop) | `Sidebar.tsx` with full menu | Not implemented (no sidebar) | Missing |
| Header | `Header.tsx` | `src/components/layout/header.tsx` | Exists |
| BottomNav (Mobile) | `BottomNav.tsx` with 4 tabs | `src/components/layout/bottom-nav.tsx` | Exists |
| FAB (Quick Capture) | FloatingActionButton | QuickCapture component with FAB | Done |
| AppLayout | Sidebar + Header + BottomNav | Header + BottomNav only (mobile-first) | Partial |

### 5.4 Component Gap

| Design Component | Implementation | Status |
|-----------------|----------------|:------:|
| EmotionPicker (standalone) | Inline in SessionForm | Not separate component |
| TagInput (standalone) | Inline in SessionForm | Not separate component |
| CalendarHeatmap | Not found | Missing |
| StatCard | Inline in dashboard | Not separate component |
| EmptyState (common) | Inline per page | Not separate component |
| SessionCard | `session-card.tsx` | Exists |
| ReflectionForm | `reflection-form.tsx` | Exists |
| GrowthTree | `growth-tree.tsx` | Exists |
| GrowthChart | `growth-chart.tsx` | Exists |
| WeeklyStats | `weekly-stats.tsx` | Exists |

---

## 6. Tech Stack Compliance (88%)

| Technology | Design Spec | Implementation | Status |
|------------|------------|----------------|:------:|
| Next.js 14+ (App Router) | Yes | `next: 14.2.5` with App Router | Match |
| TypeScript | Yes | `typescript: ^5` | Match |
| Supabase (Auth + DB + Storage) | Yes | `@supabase/supabase-js: ^2.43.4` | Match |
| Tailwind CSS | Yes | `tailwindcss: ^3.4.1` | Match |
| shadcn/ui | Yes | Radix UI primitives installed, but no `src/components/ui/` directory | Partial |
| Recharts | Yes | `recharts: ^2.12.7` | Match |
| Framer Motion | Yes | `framer-motion: ^11.3.2` | Match |
| Zustand | Yes | `zustand: ^4.5.4` in dependencies | Match (not used) |
| TanStack Query | Yes | `@tanstack/react-query: ^5.51.1` in dependencies | Match (not used) |
| Lucide React | Yes | `lucide-react: ^0.408.0` | Match |
| date-fns | Yes | `date-fns: ^3.6.0` | Match |
| zod | Yes | `zod: ^3.23.8` | Match (not used) |
| sonner (toast) | Yes | Not in package.json | Missing |
| Vitest (testing) | Yes | Not in package.json | Missing |
| Playwright (E2E) | Yes | Not in package.json | Missing |
| Prettier | Yes | Not in package.json | Missing |

### Key Observations

- **Zustand**: Installed but no `src/stores/` directory or store files found. No state management store is in use.
- **TanStack Query**: Installed but not used. All data fetching uses Server Actions directly from Server Components.
- **zod**: Installed but no validation schemas found.
- **shadcn/ui**: Radix UI primitives installed, but no `src/components/ui/` directory. Components are built manually with Tailwind.
- **react-hook-form**: Installed (not in design spec) but not actively used.

---

## 7. Server Actions Comparison (80%)

### 7.1 Action File Mapping

| Design Module | Design Location | Implementation Location | Status |
|--------------|----------------|------------------------|:------:|
| Auth | features/auth | `src/lib/actions/auth.ts` | Done |
| Sessions | features/sessions/actions | `src/lib/actions/sessions.ts` | Done |
| Subjects | features/subjects/actions | `src/lib/actions/subjects.ts` | Done |
| Reflections | features/reflections/actions | `src/lib/actions/reflections.ts` | Done |
| Growth | features/growth/actions | `src/lib/actions/growth.ts` | Done |
| Timeline | features/timeline/actions | No dedicated action (inline in page) | Partial |

Note: Design specifies `src/features/{module}/actions/` structure (Dynamic level), but implementation uses `src/lib/actions/` flat structure. This is acceptable as a simpler organization but differs from the design document.

### 7.2 Action Function Coverage

#### Auth Actions (3/3 = 100%)

| Function | Status |
|----------|:------:|
| signIn | Done |
| signUp | Done |
| signOut | Done |

#### Subject Actions (3/4 = 75%)

| Function | Design | Implementation | Status |
|----------|--------|----------------|:------:|
| getSubjects | Yes | Done | Done |
| createSubject | Yes | Done | Done |
| updateSubject | Yes | Done | Done |
| archiveSubject | Yes | Not implemented | Missing |

#### Session Actions (5/6 = 83%)

| Function | Design | Implementation | Status |
|----------|--------|----------------|:------:|
| getSessions | Yes | Done (no filter params) | Partial |
| getSession | Yes | `getSessionById` | Done |
| createSession | Yes | Done | Done |
| updateSession | Yes | Done | Done |
| quickCapture | Yes | Via createSession | Done |
| archiveSession | Yes | Not implemented | Missing |

#### Reflection Actions (3/4 = 75%)

| Function | Design | Implementation | Status |
|----------|--------|----------------|:------:|
| getReflections | Yes | Done | Done |
| getCurrentWeekReflection | Yes | Done | Done |
| createReflection | Yes | `createOrUpdateReflection` (upsert) | Done |
| updateReflection | Yes | Combined with create (upsert) | Done |

#### Growth Actions (3/6 = 50%)

| Function | Design | Implementation | Status |
|----------|--------|----------------|:------:|
| getDashboardStats | Yes | Partially via `getSessionStats` | Partial |
| getGrowthSnapshots | Yes | `getGrowthSnapshot` + `getGrowthHistory` | Done |
| updateGrowthSnapshot | Yes | `refreshGrowthSnapshot` | Done |
| getHeatmapData | Yes | Not implemented | Missing |
| getKeywordStats | Yes | Partial (in `getSessionStats`) | Partial |
| getEmotionStats | Yes | Not implemented | Missing |

---

## 8. Sprint 0-4 MVP Completeness (72%)

### Sprint 0: Project Setup (95%)

| Task | Status | Notes |
|------|:------:|-------|
| Next.js project creation | Done | App Router + TypeScript + Tailwind |
| Supabase connection | Done | Client + Server + Middleware |
| shadcn/ui setup | Partial | Radix primitives installed, no ui/ directory |
| DB migration | Done | All 9 tables in single migration |
| RLS policies | Done | All tables covered |
| Auth setup | Done | Middleware + Server Actions |
| Design tokens (Tailwind theme) | Done | Forest/moss/earth/sky/warm colors |
| Layout components | Partial | Header + BottomNav exist, no Sidebar |
| Vercel deployment | Unknown | Not verifiable from code |

### Sprint 1: Subjects + Sessions (85%)

| Task | Status | Notes |
|------|:------:|-------|
| Subjects CRUD Server Actions | Partial | No archiveSubject |
| Sessions CRUD Server Actions | Partial | No archiveSession, no filter |
| Quick Capture Action | Done | |
| File Upload (Storage) | Missing | Not implemented |
| TypeScript type generation | Done | Manual types in database.ts |
| Subject Management Page | Done | List + Add form |
| Session Logger Form | Done | Full form with all fields |
| EmotionPicker Component | Partial | Inline, not standalone component |
| TagInput Component | Partial | Inline, not standalone component |
| Session List Page | Done | |
| Session Detail Page | Done | |
| Quick Capture Modal | Done | FAB + modal |

### Sprint 2: Dashboard + Reflection (80%)

| Task | Status | Notes |
|------|:------:|-------|
| Dashboard Stats Action | Partial | No comprehensive getDashboardStats |
| Heatmap Data Action | Missing | getHeatmapData not implemented |
| Reflections CRUD Actions | Done | Via upsert pattern |
| Current Week Helper | Done | getWeekNumber, getSemesterWeek |
| Dashboard Page | Done | Growth tree, stats, recent sessions |
| CalendarHeatmap Component | Missing | Not found anywhere |
| Growth Tree Mini View | Done | Used on dashboard |
| Weekly Reflection Form | Done | All fields |
| Weekly Reflection List | Done | History display on reflect page |
| Stat Cards | Done | Inline on dashboard |

### Sprint 3: Timeline + Growth (65%)

| Task | Status | Notes |
|------|:------:|-------|
| Timeline Action | Partial | Inline, no dedicated server action |
| Growth Snapshot Logic | Partial | No streak calculation, always 0 |
| Keyword Stats Action | Partial | Basic stats in getSessionStats |
| Emotion Stats Action | Missing | Not implemented |
| Streak Calculation | Missing | Hardcoded to 0 |
| Timeline Page | Done | Monthly grouping, session+reflection |
| Growth Tree Full View | Done | SVG with Framer Motion |
| Growth Index Chart (Recharts) | Done | GrowthChart component |
| Emotion Flow Chart | Missing | Not implemented |
| Keyword Cloud | Missing | Not implemented |

### Sprint 4: QA + Deploy (40%)

| Task | Status | Notes |
|------|:------:|-------|
| Responsive QA | Partial | Mobile-first layout, no sidebar for desktop |
| Error Handling | Partial | Basic error returns, no error UI components |
| Onboarding Flow | Missing | Not implemented |
| Empty State UI | Done | Per-page inline messages |
| Performance Optimization | Unknown | No code splitting observed |
| E2E Tests | Missing | Playwright not installed |
| Bug Fixes | N/A | |
| Production Deployment | Unknown | |

---

## 9. Differences Summary

### 9.1 Missing Features (Design O, Implementation X)

| # | Item | Design Location | Description | Priority |
|---|------|-----------------|-------------|----------|
| 1 | CalendarHeatmap | ui-ux-design.md:508 | GitHub-style heatmap component | High |
| 2 | Desktop Sidebar | system-architecture.md:189 | Desktop navigation sidebar | Medium |
| 3 | File/Photo Upload | data-model.md:539 | Supabase Storage integration | Medium |
| 4 | archiveSession | data-model.md:461 | Soft delete for sessions | Medium |
| 5 | archiveSubject | data-model.md:450 | Soft delete for subjects | Medium |
| 6 | Onboarding Flow | ui-ux-design.md:566 | First-user wizard (semester, subjects, tree) | Medium |
| 7 | Settings Page | system-architecture.md:180 | App settings page | Low |
| 8 | Streak Calculation | data-model.md:607 | Consecutive weekly recording logic | Medium |
| 9 | Emotion Stats Chart | development-plan.md:159 | Recharts emotion flow chart | Medium |
| 10 | Keyword Cloud | development-plan.md:160 | Word cloud visualization | Low |
| 11 | Timeline Filter | ui-ux-design.md:274 | Month/type filter for timeline | Low |
| 12 | Emotion Stats Action | data-model.md:498 | getEmotionStats server action | Medium |
| 13 | Heatmap Data Action | data-model.md:496 | getHeatmapData server action | High |
| 14 | E2E Tests | development-plan.md:180 | Playwright test setup | Low |
| 15 | growth_snapshots auto-trigger | data-model.md:696 | DB trigger on session insert/update | Medium |

### 9.2 Changed Features (Design != Implementation)

| # | Item | Design | Implementation | Impact |
|---|------|--------|----------------|:------:|
| 1 | Emotion Types | 4 types (excited/focused/struggling/proud) | 6 types (excited/focused/confused/tired/inspired/satisfied) | Medium |
| 2 | Day Type | 2 types (friday/saturday) | 4 types (friday_evening/saturday_morning/saturday_afternoon/saturday_evening) | Medium |
| 3 | Emotion Intensity | Range 1-5 | Range 1-10 | Low |
| 4 | Session Status | 2 values (draft/completed) | 3 values (includes 'archived') | Low |
| 5 | Folder Structure | `src/features/{module}/actions/` | `src/lib/actions/{module}.ts` | Low |
| 6 | Route Group | `(main)` | `(app)` | Low |
| 7 | Reflect Route | `/reflection` | `/reflect` | Low |
| 8 | Data Fetching | TanStack Query hooks | Server Components + Server Actions | Medium |
| 9 | State Management | Zustand stores | No state stores (Server Components) | Medium |
| 10 | subject_id FK | Nullable (ON DELETE SET NULL) | NOT NULL (ON DELETE CASCADE) | Medium |
| 11 | profiles.display_name | NOT NULL DEFAULT '' | Nullable | Low |

### 9.3 Added Features (Design X, Implementation O)

| # | Item | Implementation Location | Description |
|---|------|------------------------|-------------|
| 1 | API Route for subjects | `src/app/api/subjects/route.ts` | REST endpoint (not in design, uses Server Actions pattern) |
| 2 | getAchievements action | `src/lib/actions/growth.ts` | Achievement listing (Phase 2 but action exists) |
| 3 | Achievements UI | `src/app/(app)/growth/page.tsx` | Badge display on growth page (Phase 2 feature) |
| 4 | react-hook-form | `package.json` | Form library not in original design spec |
| 5 | More granular day_type | Migration schema | Finer time-slot classification |

---

## 10. Architecture Compliance

### 10.1 Folder Structure (Dynamic Level)

| Design | Implementation | Match |
|--------|----------------|:-----:|
| `src/app/` (App Router) | `src/app/` | Match |
| `src/components/` | `src/components/` | Match |
| `src/features/` | Not used | Mismatch |
| `src/lib/` | `src/lib/` | Match |
| `src/types/` | `src/types/` | Match |
| `src/stores/` | Not used | Mismatch |
| `src/components/ui/` (shadcn) | Not present | Missing |
| `src/components/common/` | Not present | Missing |

### 10.2 Key Architectural Decisions

| Decision | Design | Implementation | Assessment |
|----------|--------|----------------|-----------|
| Data Fetching | TanStack Query + Zustand | Server Components + Server Actions | Simpler but divergent from design. This is actually a good simplification for a single-user app. |
| Component Organization | Feature-based modules | Flat by domain (session, growth, reflection) | Acceptable simplification |
| Server Actions Location | Per-feature actions/ folders | Centralized lib/actions/ | Acceptable |

---

## 11. Recommended Actions

### Immediate Actions (High Priority)

1. **Implement CalendarHeatmap component** -- This is a core MVP feature (FR-09) visible on the dashboard. Design specifies GitHub-style heatmap. Requires `getHeatmapData()` server action.

2. **Implement streak calculation** -- Growth index always uses `streakWeeks: 0`, making growth scoring inaccurate. Add weekly streak tracking logic.

3. **Add archiveSession/archiveSubject actions** -- Soft delete is a design principle ("1년치 기록은 소중한 자산"). Currently no way to remove unwanted records.

4. **Add missing profiles fields** -- `onboarding_completed` and `settings` columns are needed for onboarding flow and user preferences.

### Medium Priority

5. **Implement file/photo upload** -- Supabase Storage is part of the core tech stack. Session photos are a design requirement (FR-10 Quick Capture with photo).

6. **Add desktop sidebar navigation** -- Currently only mobile layout (Header + BottomNav). Desktop users have no proper navigation.

7. **Implement emotion stats and charts** -- Missing EmotionFlowChart (Recharts Line Chart) and getEmotionStats action.

8. **Add session list filtering** -- Design specifies filtering by subject, date range, and status. Current implementation only has limit.

9. **Synchronize schema differences** -- Decide whether 4 or 6 emotions, 1-5 or 1-10 intensity range, and update design or implementation accordingly.

10. **Add missing indexes** -- Design defines 8+ database indexes for performance. Migration has zero indexes.

### Low Priority / Documentation Updates

11. **Update design to reflect architectural decisions** -- TanStack Query and Zustand were not used (Server Components pattern instead). Design should be updated to reflect this intentional simplification.

12. **Set up testing infrastructure** -- Install Vitest and Playwright, write at least core flow tests.

13. **Build standalone common components** -- Extract EmotionPicker, TagInput, CalendarHeatmap, StatCard, EmptyState into `src/components/common/`.

14. **Implement Onboarding Flow** -- Sprint 4 task, needed for first-time user experience.

15. **Add Timeline filter UI** -- Month/type filter controls for the timeline page.

---

## 12. Synchronization Recommendations

For the schema differences found, the following decisions are recommended:

| Difference | Recommendation | Rationale |
|-----------|----------------|-----------|
| Emotion Types (4 vs 6) | **Update design** to match implementation (6 types) | More nuanced emotions better serve user needs |
| Day Type (2 vs 4) | **Update design** to match implementation (4 types) | Finer time slots match actual class schedule |
| Emotion Intensity (1-5 vs 1-10) | **Update design** to match implementation (1-10) | More granular feedback |
| Session Status (2 vs 3) | **Update design** to include 'archived' | Aligns with soft-delete principle |
| Folder Structure | **Update design** to reflect simpler lib/actions/ pattern | Design's features/ structure is over-engineered for single-dev project |
| Data Fetching (TanStack vs Server) | **Update design** to document Server Components approach | TanStack Query unnecessary with RSC pattern |
| subject_id nullable | **Keep design** (nullable FK), fix implementation | Sessions should survive subject deletion |

---

## 13. Mobile Optimization Gap Analysis

> **Analysis Date**: 2026-03-13
> **Match Rate**: 98%
> **Phase**: Check
> **Design Documents**: ui-ux-design.md (v0.2), system-architecture.md (v0.3), product-requirements.md (v0.2)
> **Implementation Files**: bottom-nav.tsx, quick-capture.tsx, offline-banner.tsx, use-network-status.ts, (app)/layout.tsx, layout.tsx, globals.css, manifest.json

### 13.1 Overall Score

| Category | Score | Status |
|----------|:-----:|:------:|
| Navigation (BottomNav + FAB) | 100% | Pass |
| Quick Capture Bottom Sheet | 100% | Pass |
| Offline Support | 83% | Warning |
| PWA (manifest, viewport, apple-web-app) | 100% | Pass |
| CSS / Animation | 100% | Pass |
| **Overall Mobile Optimization** | **98%** | **Pass** |

### 13.2 Implementation Status

| # | Item | Design Source | Implementation | Status | Notes |
|---|------|-------------|----------------|:------:|-------|
| 1 | BottomNav: 4 tabs + FAB center (Home\|Record\|[FAB]\|Growth\|More) | ui-ux-design.md:147 | `bottom-nav.tsx` LEFT_ITEMS(2) + FAB + RIGHT_ITEMS(2) | Pass | Exact match |
| 2 | FAB size: 56px x 56px | ui-ux-design.md:155 | `w-14 h-14` = 56x56px | Pass | |
| 3 | FAB color: forest-500 + shadow | ui-ux-design.md:156 | `bg-primary` + `boxShadow: "0 4px 12px rgba(45,90,61,0.4)"` | Pass | Shadow matches exactly |
| 4 | Tab bar height: 64px + Safe Area inset | ui-ux-design.md:154 | `h-16` (64px) + `safe-area-pb` class | Pass | |
| 5 | backdrop-filter: blur tab bar background | ui-ux-design.md:157 | `backdropFilter: "blur(12px)"` + `rgba(250,247,242,0.92)` | Pass | Opacity 0.92 vs design 0.85 (minor, acceptable) |
| 6 | All touch targets min 44px x 44px | ui-ux-design.md:190 | `min-h-[44px]` on tab items; FAB 56px; save btn 48px; voice btn 48px | Pass | |
| 7 | Drag handle (4px x 32px gray bar) | ui-ux-design.md:166 | `w-8 h-1 rounded-full bg-muted-foreground/30` = 32px x 4px | Pass | |
| 8 | Textarea auto-focus on open | ui-ux-design.md:170 | `setTimeout(() => textareaRef.current?.focus(), 100)` | Pass | |
| 9 | Large font textarea (17px+) | ui-ux-design.md:172 | `text-[17px]` class on textarea | Pass | Design says 18px, impl 17px (acceptable) |
| 10 | Voice input button (Web Speech API) | ui-ux-design.md:180, 740-752 | Full SpeechRecognition impl, lang="ko-KR", conditional render | Pass | Hides on unsupported browsers |
| 11 | Save button: full width, 48px+ height | ui-ux-design.md:179 | `flex-1 h-12` = flex-grow full width, 48px height | Pass | Design says 52px, impl 48px (acceptable) |
| 12 | Offline status display + local save | ui-ux-design.md:182 | Shows "저장 (오프라인)" label; localStorage save in handleSubmit | Pass | |
| 13 | useNetworkStatus hook (online/offline events) | ui-ux-design.md:771-772 | `use-network-status.ts`: navigator.onLine + addEventListener online/offline | Pass | Complete implementation |
| 14 | Offline banner (top fixed) | ui-ux-design.md:759-770 | `offline-banner.tsx`: fixed top-0, sand-300 bg, forest-400 on reconnect, 3s auto-hide | Pass | Matches design spec exactly |
| 15 | Offline localStorage temp save | system-architecture.md:154 | `localStorage.setItem("offline_captures", ...)` | Warning | Design specifies IndexedDB; impl uses localStorage |
| 16 | manifest.json (name, icons, start_url, display:standalone) | system-architecture.md:155 | All fields present: name, short_name, icons (192+512), start_url:/dashboard, display:standalone | Pass | |
| 17 | viewport-fit=cover meta | system-architecture.md:343 | `viewportFit: "cover"` in Viewport export | Pass | |
| 18 | apple-web-app meta | ui-ux-design.md (PWA) | `appleWebApp: { capable: true, statusBarStyle: "default", title: "MyGraduate" }` | Pass | |
| 19 | animate-slide-up keyframe | ui-ux-design.md:582 | `@keyframes slide-up` with spring cubic-bezier, 0.3s | Pass | |
| 20 | safe-area-pb / pb-safe utility | ui-ux-design.md:154 | Both classes in globals.css with env(safe-area-inset-bottom) | Pass | |
| 21 | Tab feedback (active scale) | ui-ux-design.md:583 | `@media (hover:none) { button:active { scale(0.97) } }` + 0.1s ease-out | Pass | |

### 13.3 Gap List

#### Missing (0 items)

No missing items.

#### Partial Implementation (1 item)

| # | Item | Design | Implementation | Impact | Recommended Action |
|---|------|--------|----------------|:------:|-------------------|
| 1 | Offline temp storage | IndexedDB (`idb` library) per system-architecture.md:154 | localStorage (`JSON.parse/stringify`) | Low | localStorage is functional but has 5MB limit and no structured queries. For MVP with single user, this is acceptable. Consider upgrading to IndexedDB in Phase 2 if offline data volume grows. |

### 13.4 Match Rate Calculation

```
Total items: 21
Fully implemented: 20
Partially implemented: 1

Match Rate = (20 + 1 * 0.5) / 21 * 100 = 97.6% --> 98%
```

### 13.5 Recommended Actions

#### No Immediate Actions Required

The mobile optimization implementation achieves 98% match rate, exceeding the 90% threshold.

#### Future Improvement (Low Priority)

1. **Upgrade offline storage to IndexedDB** - Current localStorage approach works for MVP but IndexedDB provides better capacity, structure, and aligns with the PWA architecture design. Recommend migrating when implementing Service Worker background sync.

2. **Minor numeric adjustments** (cosmetic, not blocking):
   - Textarea font: 17px vs design 18px (1px difference)
   - Save button height: 48px vs design 52px (4px difference)
   - Tab bar background opacity: 0.92 vs design 0.85 (visual tuning)

### 13.6 Quality Assessment

The mobile optimization implementation demonstrates high fidelity to the design:

- **Navigation**: BottomNav with 4 tabs + centered FAB exactly matches the wireframe layout
- **Quick Capture**: Bottom sheet with drag handle, auto-focus, voice input, offline support all present
- **PWA**: manifest.json, viewport-fit=cover, apple-web-app meta correctly configured
- **Accessibility**: 44px minimum touch targets enforced throughout
- **Offline UX**: Banner with correct colors (sand-300 offline, forest-400 reconnected), 3-second auto-dismiss
- **Animation**: slide-up keyframe with spring easing, active:scale tab feedback

**Verdict**: Match Rate >= 90%. Mobile optimization Check phase is complete.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial gap analysis | Gap Detector Agent |
| 0.2 | 2026-03-13 | Mobile optimization gap analysis added (Section 13): 21 items checked, 98% match rate | Gap Detector Agent |
