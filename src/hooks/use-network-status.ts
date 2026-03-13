"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { syncOfflineCaptures, getOfflineCaptureCount } from "@/lib/offline-sync";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);
  const router = useRouter();
  const isSyncingRef = useRef(false);

  // 오프라인 대기 건수 주기적 업데이트
  useEffect(() => {
    setPendingCount(getOfflineCaptureCount());
  }, [isOnline]);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setPendingCount(getOfflineCaptureCount());
    };

    const handleOnline = async () => {
      setIsOnline(true);
      if (isSyncingRef.current) return;

      const count = getOfflineCaptureCount();
      if (count === 0) return;

      isSyncingRef.current = true;
      try {
        const synced = await syncOfflineCaptures();
        setPendingCount(getOfflineCaptureCount());
        if (synced > 0) {
          router.refresh(); // 서버 컴포넌트 데이터 갱신
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  return { isOnline, pendingCount };
}
