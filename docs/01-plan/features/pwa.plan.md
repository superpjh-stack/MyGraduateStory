# PWA (Progressive Web App) — Plan Document

> **Feature**: pwa
> **Project**: MyGraduate
> **Phase**: Plan
> **Date**: 2026-03-13
> **Priority**: Medium (기획서 D-11)
> **Status**: Planning

---

## 1. Overview

### 1.1 목적

MyGraduate를 PWA로 전환하여 수업 중 홈화면에서 네이티브 앱처럼 즉시 접근하고, 오프라인 Quick Capture를 완전히 지원한다.

### 1.2 배경

기획서 D-11 "PWA 설치" 및 NFR "PWA 체크리스트 통과"가 미구현 상태. 현재 앱은:
- 홈화면 추가(A2HS) 불가 — manifest.json 없음
- Service Worker 없음 — 오프라인 캐싱 미동작
- IndexedDB 저장 로직은 있으나 Supabase 자동 동기화 미연결

### 1.3 사용자 가치

```
수업 중 시나리오:
  WiFi 불안정 → Quick Capture 탭 → 로컬 저장 → 수업 종료 후 자동 동기화

홈화면 시나리오:
  홈화면 MyGraduate 아이콘 탭 → 즉시 앱 실행 (브라우저 UI 없음)
```

---

## 2. 기능 범위

### 2.1 In Scope

| ID | 기능 | 설명 |
|----|------|------|
| PWA-01 | Web App Manifest | 앱 이름, 아이콘, 테마 색상, standalone 모드 |
| PWA-02 | Service Worker | 정적 자산 캐싱 (Next.js App Router 대응) |
| PWA-03 | 오프라인 Quick Capture 동기화 | IndexedDB → 온라인 복귀 시 Supabase 자동 업로드 |
| PWA-04 | 설치 프롬프트 배너 | 홈화면 추가 안내 (iOS/Android) |
| PWA-05 | 오프라인 상태 표시 | 네트워크 상태에 따른 UI 피드백 |

### 2.2 Out of Scope

- 푸시 알림 (Push Notifications) — 별도 기능으로 분리
- 백그라운드 동기화 (Background Sync API) — 기본 온라인 복귀 감지로 대체
- App Store 등록

---

## 3. 기술 요구사항

### 3.1 Web App Manifest (`public/manifest.json`)

```json
{
  "name": "MyGraduate",
  "short_name": "MyGrad",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "icons": [ ... 192x192, 512x512 ... ]
}
```

### 3.2 Service Worker 전략

- **Next.js 14**: `next-pwa` 라이브러리 사용 (`serwist` 또는 `@ducanh2912/next-pwa`)
- **캐싱 전략**:
  - 정적 자산: CacheFirst
  - API 라우트: NetworkFirst
  - 페이지: StaleWhileRevalidate

### 3.3 오프라인 동기화

현재 `useNetworkStatus` 훅과 `OfflineBanner` 컴포넌트가 존재. 확장:
```
온라인 복귀 감지 → IndexedDB 잔여 데이터 조회 → createSession() 순차 호출
```

### 3.4 앱 아이콘

- 192×192, 512×512 PNG 아이콘 필요
- `public/icons/` 디렉토리에 저장
- 앱 테마: forest green (#16a34a)

---

## 4. 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@ducanh2912/next-pwa` | ^10.x | Next.js 14 호환 PWA 플러그인 |
| `idb` (선택) | ^8.x | IndexedDB wrapper (현재 native IDB 사용 중) |

---

## 5. 구현 순서

```
1. public/manifest.json 생성
2. public/icons/ 아이콘 파일 추가
3. next.config.js에 next-pwa 플러그인 설정
4. app/layout.tsx에 manifest 링크 및 메타태그 추가
5. Service Worker 동작 확인 (개발 환경 제외)
6. 오프라인 동기화: useNetworkStatus 훅 확장
7. 설치 프롬프트 배너 컴포넌트 추가
```

---

## 6. 성공 기준

| 기준 | 측정 방법 |
|------|----------|
| Lighthouse PWA 체크리스트 통과 | Lighthouse CLI |
| iOS Safari "홈화면에 추가" 동작 | 기기 테스트 |
| Android Chrome 설치 프롬프트 표시 | 기기 테스트 |
| 오프라인 Quick Capture → 재연결 후 Supabase 동기화 | 수동 테스트 |
| Standalone 모드로 실행 (주소창 없음) | 홈화면 실행 확인 |

---

## 7. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Next.js 14 App Router + Service Worker 충돌 | High | `@ducanh2912/next-pwa` 검증된 조합 사용 |
| iOS Safari PWA 제한 (Push 알림, 백그라운드 동기화) | Low | 범위 외로 제외, 기본 동기화만 구현 |
| 개발 환경 Service Worker 충돌 | Medium | `disable: process.env.NODE_ENV === 'development'` |
