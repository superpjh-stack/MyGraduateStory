# MyGraduate - AI 대학원 학습 트래킹 웹앱 제품 요구사항 문서

> **Summary**: 1년간의 AI 대학원 여정을 체계적으로 기록하고, 졸업 시 나만의 성장 스토리로 남기는 감성 학습 트래킹 웹앱
>
> **Project**: MyGraduate
> **Version**: 0.1.0
> **Author**: CTO Lead (기획자1 + 기획자2 통합)
> **Date**: 2026-03-13
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

MyGraduate는 단순한 학습 관리 도구가 아닌, AI 대학원 1년 과정을 **하나의 이야기**로 엮어주는 스토리텔링 웹앱이다. 매주 금요일 저녁과 토요일 종일의 수업을 기록하고, 회고하고, 시각화하여 석사 학위 취득 시점에 "내가 이렇게 성장했구나"를 온전히 느낄 수 있도록 한다.

### 1.2 Background

- **사용자**: Gerardo, AI 분야 대학원생
- **학습 일정**: 매주 금요일 저녁 + 토요일 종일 (약 52주, ~104회 수업)
- **핵심 니즈**:
  - 바쁜 직장인 대학원생이 빠르게 기록할 수 있는 간편함
  - 시간이 지나도 기억이 사라지지 않는 보존력
  - 1년 후 돌아봤을 때 성장을 체감할 수 있는 시각화
- **감성적 목표**: 졸업장을 받는 순간, 이 앱을 열면 1년의 모든 순간이 떠오르는 것

### 1.3 핵심 가치 정의

| 가치 | 설명 | 메타포 |
|------|------|--------|
| **기록 (Record)** | 매 수업의 배움을 빠르게 포착 | 타임캡슐에 편지 넣기 |
| **회고 (Reflect)** | 주간/월간 단위로 배움을 되새김 | 일기장을 넘기는 느낌 |
| **성장 (Grow)** | 누적된 학습이 시각적으로 성장하는 모습 | 씨앗에서 나무로 |
| **스토리 (Story)** | 졸업 시 자동 생성되는 나만의 이야기 | 졸업 앨범 + 자서전 |

---

## 2. 사용자 스토리 & 여정

### 2.1 핵심 사용자 여정 (Weekly Cycle)

```
금요일 저녁                    토요일 종일                    일요일 (선택)
┌─────────────┐            ┌─────────────┐            ┌─────────────┐
│  수업 시작   │            │  수업 시작   │            │  주간 회고   │
│  Quick Note  │───────────▶│  Deep Note   │───────────▶│  Weekly      │
│  (간단 메모) │            │  (상세 기록) │            │  Reflection  │
└─────────────┘            └─────────────┘            └─────────────┘
       │                          │                          │
       ▼                          ▼                          ▼
  핵심 키워드 태깅          배운 것/느낀 것 기록       성장 지표 업데이트
  감정 온도 체크           과제/프로젝트 연결          나무 성장 애니메이션
  사진 첨부 (선택)         참고 자료 링크              다음 주 다짐 작성
```

### 2.1-M 모바일 Quick Capture 시나리오 (핵심 신규)

> **목표**: 수업 중 스마트폰 한 손 조작, 5초 이내 메모 완료

```
[수업 중 순간 포착]
    │
    ▼ 1초: FAB(+) 버튼 탭 (엄지손가락 닿는 위치)
    │
    ▼ 0.3초: 바텀 시트 슬라이드 업 + 키보드 자동 등장
    │
    ▼ 3초: 생각 입력 (텍스트 타이핑 or 🎤 음성 입력)
    │       오프라인이면 IndexedDB에 임시 저장
    │
    ▼ 0.1초: "저장" 탭 → 시트 닫힘
    │
    ▼ 즉시: UI에 반영 (낙관적 업데이트)
    │       백그라운드: Supabase 동기화
    │
총 소요 시간: 목표 5초, 최대 10초
교수님 말씀 놓치지 않는 것이 최우선!
```

**모바일 사용 컨텍스트:**
- 환경: 강의실 (WiFi 불안정할 수 있음)
- 자세: 책상에서 폰 세로 방향, 한 손 조작
- 집중 방해 최소화: 최소한의 UI, 빠른 입력 후 즉시 종료
- 화면 꺼짐 방지: Screen Wake Lock 옵션 (설정에서 on/off)

**모바일 사용자 스토리 (US-M):**

| ID | 스토리 | 완료 기준 |
|----|--------|---------|
| US-M01 | 수업 중 한 손으로 5초 이내에 메모를 저장할 수 있다 | FAB 탭부터 저장 완료까지 5초 이내 실측 |
| US-M02 | WiFi가 불안정해도 메모가 유실되지 않는다 | 오프라인 저장 후 연결 시 자동 동기화 확인 |
| US-M03 | 말로 빠르게 메모를 남길 수 있다 | 음성 입력 → 텍스트 변환 후 편집 화면 진입 |
| US-M04 | 수업 중 화면이 꺼지지 않도록 설정할 수 있다 | 기록 화면 활성 시 화면 잠금 일시 비활성화 |
| US-M05 | 모든 핵심 버튼이 엄지손가락으로 쉽게 닿는다 | 핵심 액션 버튼 하단 배치 + 44px 이상 터치 타겟 |

### 2.2 월간 여정

```
Week 1 ─── Week 2 ─── Week 3 ─── Week 4
  │           │           │           │
  └───────────┴───────────┴───────────┘
                    │
              월간 회고 생성
           "이번 달의 나" 리포트
           성장 그래프 업데이트
           월간 하이라이트 선정
```

### 2.3 연간 여정 (The Grand Story)

```
학기 1 (1~6개월)                    학기 2 (7~12개월)
┌─────────────────────┐          ┌─────────────────────┐
│  Chapter 1: 시작     │          │  Chapter 3: 도약     │
│  새로운 세계에 발을  │          │  전문성이 깊어지는   │
│  내딛다              │          │  시기                 │
├─────────────────────┤          ├─────────────────────┤
│  Chapter 2: 성장     │          │  Chapter 4: 완성     │
│  기초를 다지고       │          │  석사의 면모를       │
│  시야가 넓어지다     │          │  갖추다              │
└─────────────────────┘          └─────────────────────┘
                    │
                    ▼
           졸업 스토리북 자동 생성
           "Gerardo의 AI 대학원 이야기"
```

---

## 3. 주요 기능 정의

### 3.1 기능 목록 (기획자1: 핵심 기능)

| ID | 기능명 | 설명 | Priority | Category |
|----|--------|------|----------|----------|
| F-01 | **Quick Capture** | 수업 중 빠르게 메모하는 간편 입력 (음성/텍스트/사진); 목표 5초 완료; FAB → 바텀 시트; 오프라인 IndexedDB 임시 저장 지원 | High | Record |
| F-02 | **Session Logger** | 수업 회차별 상세 기록 (배운 것, 느낀 것, 키워드) | High | Record |
| F-03 | **감정 온도계** | 각 수업의 감정 상태 기록 (기대/몰입/힘듦/뿌듯함) | High | Record |
| F-04 | **Weekly Reflection** | 주간 회고 작성 (이번 주 핵심 배움, 다음 주 다짐) | High | Reflect |
| F-05 | **Monthly Report** | 월간 자동 리포트 생성 (학습 통계, 하이라이트) | Medium | Reflect |
| F-06 | **Growth Tree** | 학습 누적에 따라 자라나는 나무 비주얼라이제이션 | High | Grow |
| F-07 | **Knowledge Map** | 학습한 키워드/개념 간의 연결 관계를 시각화 | Medium | Grow |
| F-08 | **Timeline** | 1년간의 학습을 시간순으로 보여주는 타임라인 뷰 | High | Story |
| F-09 | **Graduation Storybook** | 졸업 시 자동 생성되는 나만의 성장 스토리 PDF/웹북 | High | Story |
| F-10 | **Dashboard** | 전체 진행 현황을 한눈에 보는 메인 화면 | High | Core |
| F-11 | **과목 관리** | 수강 과목별 분류 및 관리 | High | Core |
| F-12 | **과제/프로젝트 트래커** | 과목별 과제, 팀프로젝트 진행 상황 추적 | Medium | Record |
| F-13 | **오프라인 캐싱** | 수업 중 WiFi 불안정/무연결 환경에서도 Quick Capture 로컬 저장(IndexedDB) 후 온라인 복귀 시 자동 동기화 | High | Core |
| F-14 | **화면 잠금 방지** | 기록 화면 활성 중 스마트폰 자동 화면 꺼짐 방지 옵션 (Screen Wake Lock API) | Medium | Core |

### 3.2 차별화 기능 (기획자2: 서비스 차별화)

| ID | 기능명 | 설명 | 차별화 포인트 |
|----|--------|------|---------------|
| D-01 | **AI 학습 요약** | 기록한 내용을 AI가 주간/월간 요약으로 정리 | 기존 앱: 수동 정리 필요 |
| D-02 | **성장 지수 (Growth Index)** | 다양한 지표를 종합한 나만의 성장 점수 | 단순 출석체크 대비 다차원 성장 추적 |
| D-03 | **Time Capsule** | 미래의 나에게 보내는 편지 기능 (특정 시점에 열림) | 감성적 동기부여, 자기와의 대화 |
| D-04 | **Before & After** | 학기 초/말 자가진단 비교 | 성장을 객관적으로 체감 |
| D-05 | **Achievement Badges** | 학습 마일스톤 달성 시 배지 수여 | 게이미피케이션을 통한 동기부여 |
| D-06 | **Weekly Streak** | 연속 기록 주차 표시 (잔디 심기 스타일) | 습관 형성 동기 |
| D-07 | **Mood Tracker** | 감정 변화를 시각화한 차트 (학업 스트레스 관리) | 학습 + 웰빙의 통합 |
| D-08 | **Peer Quotes** | 동기들과 나눈 인상적인 대화/조언 기록 | 관계와 추억의 보존 |
| D-09 | **Screen Wake Lock** | 수업 중 화면 꺼짐 방지 (설정에서 on/off) | 수업 중 폰 화면 유지 |
| D-10 | **오프라인 자동 동기화** | 강의실 WiFi 불안정 시 IndexedDB 임시 저장 → 온라인 복귀 시 자동 Supabase 업로드 | 수업 중 데이터 유실 0% |
| D-11 | **PWA 설치** | 홈 화면에 앱 추가 (iOS Safari, Android Chrome) | 네이티브 앱처럼 바로 접근 |

### 3.3 통계/분석 기능 아이디어 (기획자2)

| 분석 항목 | 시각화 방식 | 인사이트 |
|-----------|------------|----------|
| 주간 학습 시간 | Bar Chart | 투자 시간 트렌드 |
| 과목별 몰입도 | Radar Chart | 강점/약점 과목 파악 |
| 감정 흐름 | Line Chart | 학기별 감정 패턴 |
| 키워드 빈도 | Word Cloud | 핵심 관심사 변화 추적 |
| 성장 지수 추이 | Area Chart | 종합 성장 시각화 |
| 출석/기록률 | Calendar Heatmap | GitHub 잔디 스타일 |
| 과목 간 연관성 | Network Graph | 학문 간 연결고리 |

### 3.4 졸업 스토리북 기능 상세 (기획자2)

졸업 시 자동 생성되는 **"Gerardo의 AI 대학원 이야기"** 디지털 북:

```
Chapter 1: 출발점
  - 입학 시점의 자기 진단 결과
  - 첫 수업 메모와 감정
  - "이때의 나는 이런 사람이었다"

Chapter 2: 기초를 다지다 (1~3개월)
  - 가장 많이 기록한 키워드
  - 첫 번째 "아하!" 순간
  - 이 시기의 감정 흐름

Chapter 3: 깊어지다 (4~6개월)
  - 중간고사 전후 이야기
  - 가장 도전적이었던 과제
  - 성장 그래프의 변곡점

Chapter 4: 확장하다 (7~9개월)
  - 새로운 시각이 열린 순간
  - 팀프로젝트 에피소드
  - Knowledge Map의 확장

Chapter 5: 완성하다 (10~12개월)
  - 석사 논문/프로젝트 여정
  - Before & After 비교
  - 미래의 나에게 보낸 편지 공개

Epilogue: 석사, Gerardo
  - 1년 종합 통계
  - 가장 기억에 남는 순간 Top 5
  - 다음 여정을 향한 다짐
```

---

## 4. Scope

### 4.1 In Scope (MVP - Phase 1)

- [x] 사용자 인증 (단일 사용자 기준)
- [x] 과목 관리 (CRUD)
- [x] Session Logger (수업 기록)
- [x] Quick Capture (간편 메모)
- [x] 감정 온도계
- [x] Weekly Reflection
- [x] Dashboard (메인 화면)
- [x] Timeline View
- [x] Growth Tree (기본 시각화)
- [x] Calendar Heatmap (출석/기록률)
- [x] 오프라인 캐싱 (Quick Capture 데이터, IndexedDB)
- [x] 화면 잠금 방지 옵션 (Screen Wake Lock)

### 4.2 Phase 2 (Enhancement)

- [ ] Monthly Report 자동 생성
- [ ] Knowledge Map
- [ ] AI 학습 요약
- [ ] Achievement Badges
- [ ] Time Capsule
- [ ] Before & After 자가진단

### 4.3 Phase 3 (Graduation)

- [ ] Graduation Storybook 자동 생성
- [ ] PDF/웹북 Export
- [ ] 성장 지수 종합 분석
- [ ] 1년 데이터 아카이빙

### 4.4 Out of Scope

- 다중 사용자/소셜 기능 (개인 용도)
- 모바일 네이티브 앱 (반응형 웹으로 대체 — 단, 반응형 웹은 수업 중 한 손 조작 시나리오를 완전히 지원해야 함)
- 실시간 협업 기능
- LMS(학습관리시스템) 연동

---

## 5. 기능 요구사항

### 5.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 사용자가 수업 회차를 생성하고 기록할 수 있다 | High | Pending |
| FR-02 | 수업 기록에 키워드 태그를 추가할 수 있다 | High | Pending |
| FR-03 | 각 수업의 감정 상태를 4단계(기대/몰입/힘듦/뿌듯함)로 기록할 수 있다 | High | Pending |
| FR-04 | 주간 회고를 작성하고 조회할 수 있다 | High | Pending |
| FR-05 | 대시보드에서 전체 진행 현황을 확인할 수 있다 | High | Pending |
| FR-06 | 타임라인 뷰에서 시간순으로 학습 기록을 조회할 수 있다 | High | Pending |
| FR-07 | 과목별로 수업 기록을 분류/필터링할 수 있다 | High | Pending |
| FR-08 | Growth Tree가 학습 누적에 따라 시각적으로 성장한다 | High | Pending |
| FR-09 | Calendar Heatmap에서 기록률을 GitHub 잔디 스타일로 확인한다 | Medium | Pending |
| FR-10 | Quick Capture로 수업 중 한 손 조작, 5초 이내에 메모를 남길 수 있다 | **High** | Pending |
| FR-11 | 과제/프로젝트 진행 상황을 기록하고 추적할 수 있다 | Medium | Pending |
| FR-12 | 졸업 스토리북이 자동으로 생성된다 | Low (Phase 3) | Pending |
| FR-13 | 오프라인 상태에서 Quick Capture 데이터를 로컬 저장하고, 온라인 복귀 시 자동 동기화된다 | High | Pending |
| FR-14 | Quick Capture에서 음성 입력(STT)으로 메모를 남길 수 있다 | High | Pending |
| FR-15 | 기록 화면 활성 중 화면 자동 꺼짐 방지를 설정/해제할 수 있다 | Medium | Pending |

### 5.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 페이지 로딩 < 2초 (Lighthouse 기준) | Lighthouse CI |
| Responsive | 모바일/태블릿/데스크탑 대응 | 디바이스 테스트 |
| Data Safety | 모든 기록 데이터 백업 보장 | 자동 백업 확인 |
| Accessibility | WCAG 2.1 AA 기본 충족 | axe DevTools |
| SEO | SSR/SSG 적용으로 메타 정보 제공 | Lighthouse SEO Score |
| **Mobile Performance** | Lighthouse Mobile Score >= 90 | Lighthouse CI (모바일 환경) |
| **Quick Capture Speed** | FAB 탭 → 저장 완료 목표 5초 이내 | 실제 사용 측정 |
| **Touch Target** | 모든 인터랙티브 요소 최소 44px × 44px | Apple HIG / WCAG 2.5.5 |
| **Offline Support** | 오프라인 Quick Capture → 온라인 복귀 시 100% 동기화 | Service Worker 동작 확인 |
| **PWA** | Lighthouse PWA 체크리스트 통과 (Installable + Offline) | Lighthouse PWA |

---

## 6. Success Criteria

### 6.1 Definition of Done

- [ ] MVP 기능 전체 구현 및 배포
- [ ] 반응형 디자인 적용 (모바일 우선)
- [ ] 핵심 사용자 플로우 E2E 테스트 통과
- [ ] 1주일간 실제 사용 후 피드백 반영

### 6.2 Quality Criteria

- [ ] Lighthouse Performance >= 90
- [ ] 핵심 기능 테스트 커버리지 >= 80%
- [ ] Zero critical/high severity bugs
- [ ] 접근성 기본 점검 통과

---

## 7. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 바쁜 일정으로 기록을 안 하게 됨 | High | High | Quick Capture로 진입 장벽 최소화, Push 알림 |
| 1년치 데이터 유실 | High | Low | 자동 백업, 데이터 Export 기능 |
| 감성 디자인이 과하면 사용성 저하 | Medium | Medium | 기능 우선, 디자인은 점진적 적용 |
| 기술 스택 학습 비용 | Medium | Low | 검증된 스택 선택, 점진적 구현 |
| 1인 개발로 속도 저하 | Medium | Medium | MVP 최소화, Phase별 점진 릴리스 |

---

## 8. Architecture Considerations

### 8.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | -- |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | **Selected** |
| **Enterprise** | Strict layer separation, microservices | High-traffic systems | -- |

**선택 이유**: 개인 프로젝트로 복잡한 인프라 불필요, 하지만 인증/데이터 저장이 필요하므로 Dynamic 레벨이 적합. BaaS(bkend.ai 또는 Supabase)를 활용하여 백엔드 개발 부담을 최소화.

### 8.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / Remix / SvelteKit | **Next.js 14+** | App Router, SSR/SSG, 생태계 |
| State Management | Zustand / Jotai / Context | **Zustand** | 경량, 직관적, TypeScript 친화 |
| API Client | TanStack Query / SWR | **TanStack Query** | 캐싱, 자동 재시도, 옵티미스틱 업데이트 |
| Styling | Tailwind CSS + shadcn/ui | **Tailwind + shadcn/ui** | 빠른 개발, 일관된 디자인 시스템 |
| Backend/DB | Supabase / bkend.ai / Firebase | **Supabase** | PostgreSQL, Auth 내장, 실시간 구독 |
| 시각화 | D3.js / Recharts / Chart.js | **Recharts + Custom SVG** | React 친화, Growth Tree는 Custom |
| Testing | Vitest + Playwright | **Vitest + Playwright** | 빠른 실행, E2E 지원 |
| Deployment | Vercel / Netlify | **Vercel** | Next.js 최적 호스팅 |

---

## 9. Next Steps

1. [ ] 시스템 아키텍처 설계 (`system-architecture.md`)
2. [ ] UI/UX 디자인 설계 (`ui-ux-design.md`)
3. [ ] 데이터 모델 설계 (`data-model.md`)
4. [ ] 개발 계획 수립 (`development-plan.md`)
5. [ ] MVP Phase 1 구현 착수

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-13 | Initial draft (기획자1+기획자2 통합) | CTO Lead |
| 0.2 | 2026-03-13 | 모바일 최적화 강화: Section 2.1-M 모바일 Quick Capture 시나리오 추가, F-01 Quick Capture 사양 강화, 차별화 기능 D-09~D-11 (Screen Wake Lock, 오프라인 동기화, PWA 설치) 추가, NFR에 모바일 성능 기준 5개 추가 | Product Manager |
