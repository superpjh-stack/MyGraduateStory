# PWA — Design Document

> **Feature**: pwa
> **Project**: MyGraduate
> **Phase**: Design
> **Date**: 2026-03-13
> **Refs**: `docs/01-plan/features/pwa.plan.md`

---

## 1. 현황 분석

코드베이스에 이미 부분적으로 PWA 인프라가 준비되어 있음:

| 항목 | 현황 | 필요 작업 |
|------|------|----------|
| `manifest.json` 링크 | ✅ `app/layout.tsx`에 이미 선언 | `public/manifest.json` 파일 생성만 필요 |
| Apple Web App 메타태그 | ✅ `appleWebApp` 설정 이미 있음 | 추가 작업 없음 |
| 오프라인 감지 | ✅ `useNetworkStatus` 훅 존재 | 동기화 트리거 추가 필요 |
| 오프라인 저장 | ✅ `localStorage("offline_captures")` 저장 중 | Supabase 동기화 로직 없음 |
| Service Worker | ❌ 없음 | `@ducanh2912/next-pwa` 추가 |
| 앱 아이콘 | ❌ 없음 | SVG → PNG 변환 후 `public/icons/` 배치 |

---

## 2. 아키텍처

### 2.1 파일 구조

```
public/
  manifest.json          ← 신규 생성
  icons/
    icon-192.png         ← 신규 생성
    icon-512.png         ← 신규 생성
    apple-touch-icon.png ← 신규 생성 (180x180)

src/
  hooks/
    use-network-status.ts         ← 동기화 트리거 추가
  lib/
    offline-sync.ts               ← 신규: localStorage → Supabase 동기화
  components/
    common/
      pwa-install-banner.tsx      ← 신규: 설치 유도 배너
      offline-banner.tsx          ← 기존: 수정 없음

next.config.mjs                   ← next-pwa 플러그인 추가
```

### 2.2 데이터 흐름

```
[오프라인 Quick Capture]
  └─ localStorage.setItem("offline_captures", [...])

[온라인 복귀 감지 — useNetworkStatus]
  └─ window "online" 이벤트 발생
      └─ syncOfflineCaptures() 호출
          ├─ localStorage 잔여 데이터 읽기
          ├─ createSession() 순차 호출 (Supabase)
          ├─ 성공 항목 localStorage에서 제거
          └─ router.refresh() 트리거
```

---

## 3. 구현 명세

### 3.1 `public/manifest.json`

```json
{
  "name": "MyGraduate",
  "short_name": "MyGrad",
  "description": "AI 대학원 학습 트래킹 앱",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "categories": ["education", "productivity"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### 3.2 `next.config.mjs` — next-pwa 통합

```js
import withPWA from "@ducanh2912/next-pwa";

const nextConfig = { /* 기존 설정 유지 */ };

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: false,        // 직접 동기화 로직 사용
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
})(nextConfig);
```

### 3.3 `src/lib/offline-sync.ts` — 신규

```typescript
// localStorage 오프라인 캡처 → Supabase 동기화
export const OFFLINE_KEY = "offline_captures";

export function getOfflineCaptures(): OfflineCapture[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(OFFLINE_KEY) ?? "[]");
}

export function clearOfflineCaptures(): void {
  localStorage.removeItem(OFFLINE_KEY);
}

export async function syncOfflineCaptures(): Promise<number> {
  const captures = getOfflineCaptures();
  if (captures.length === 0) return 0;

  let synced = 0;
  const remaining: OfflineCapture[] = [];

  for (const capture of captures) {
    try {
      await createSession(capture);  // Server Action
      synced++;
    } catch {
      remaining.push(capture);       // 실패 항목 보존
    }
  }

  if (remaining.length === 0) {
    clearOfflineCaptures();
  } else {
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
  }

  return synced;
}
```

### 3.4 `src/hooks/use-network-status.ts` — 확장

```typescript
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(...);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // 오프라인 데이터 동기화
      const synced = await syncOfflineCaptures();
      if (synced > 0) router.refresh();
    };
    // ... 기존 offline 핸들러 유지
  }, []);

  return { isOnline };
}
```

### 3.5 `src/components/common/pwa-install-banner.tsx` — 신규

```typescript
// BeforeInstallPromptEvent 감지 → "홈화면에 추가" 배너 표시
// iOS: 수동 안내 메시지 ("Safari → 공유 → 홈 화면에 추가")
// Android: 프롬프트 트리거

조건:
  - 이미 standalone 모드면 표시 안 함 (window.matchMedia('(display-mode: standalone)'))
  - 배너 닫기 → localStorage에 "pwa_banner_dismissed" 저장 (7일간 미표시)
  - AppShell에 마운트
```

---

## 4. 아이콘 생성 전략

별도 디자인 툴 없이 SVG → PNG 변환:

```
방법: public/icons/icon.svg 생성 후 브라우저 Canvas API로 PNG 변환
또는: sharp 패키지로 빌드 타임 생성
또는: 실제 PNG 파일 직접 public/icons/ 에 배치

최소 필요:
  - icon-192.png (192×192)
  - icon-512.png (512×512)
  - apple-touch-icon.png (180×180)
```

디자인: forest green (#16a34a) 배경 + 흰색 🌱 이모지 스타일 아이콘

---

## 5. 구현 순서

```
Step 1: 패키지 설치
  npm install @ducanh2912/next-pwa

Step 2: 아이콘 생성
  public/icons/icon-192.png, icon-512.png, apple-touch-icon.png

Step 3: public/manifest.json 생성

Step 4: next.config.mjs 수정 (withPWA 래핑)

Step 5: src/lib/offline-sync.ts 생성

Step 6: src/hooks/use-network-status.ts 확장 (동기화 트리거)

Step 7: src/components/common/pwa-install-banner.tsx 생성

Step 8: src/components/layout/app-shell.tsx에 PwaInstallBanner 마운트

Step 9: 빌드 테스트 + Lighthouse PWA 점수 확인
```

---

## 6. 검증 기준

| 체크포인트 | 방법 |
|-----------|------|
| Lighthouse PWA 체크리스트 ✅ | `npx lighthouse --only-categories=pwa` |
| manifest.json 인식 | 크롬 DevTools → Application → Manifest |
| Service Worker 등록 | DevTools → Application → Service Workers |
| 오프라인 저장 → 재연결 동기화 | DevTools → Network → Offline 토글 |
| iOS "홈 화면에 추가" 동작 | Safari 공유 버튼 확인 |
| 설치 배너 표시 | Android Chrome 첫 방문 |

---

## 7. 의존성 변경

| 패키지 | 액션 | 이유 |
|--------|------|------|
| `@ducanh2912/next-pwa` | 추가 | Next.js 14 App Router PWA 지원 |

기존 코드 변경 최소화 — `quick-capture.tsx` 오프라인 저장 로직은 그대로 유지, 동기화만 `use-network-status.ts`에 추가.
