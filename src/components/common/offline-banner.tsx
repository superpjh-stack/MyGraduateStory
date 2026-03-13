"use client";

import { useEffect, useState } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { WifiOff, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const { isOnline, pendingCount } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200",
        !isOnline ? "bg-sand-300" : "bg-forest-400"
      )}
      style={{ paddingTop: "calc(0.625rem + env(safe-area-inset-top, 0px))" }}
    >
      {!isOnline ? (
        <>
          <WifiOff size={15} />
          <span>
            오프라인 상태{pendingCount > 0 ? ` · ${pendingCount}개 대기 중` : ""} · 연결 시 자동 동기화
          </span>
        </>
      ) : (
        <>
          <CheckCircle size={15} />
          <span>동기화 완료! 모든 기록이 저장되었습니다</span>
        </>
      )}
    </div>
  );
}
