"use client";

import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

const DISMISS_KEY = "pwa_banner_dismissed_at";
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < DISMISS_DAYS * 86400_000;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true)
  );
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (isStandalone() || isDismissed()) return;

    const ios = isIOS();
    setIsIos(ios);

    if (ios) {
      // iOS: 수동 안내 (BeforeInstallPrompt 없음)
      setShow(true);
      return;
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-card border rounded-2xl shadow-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <div>
            <p className="text-sm font-semibold">MyGraduate 설치</p>
            <p className="text-xs text-muted-foreground">홈화면에 추가하면 앱처럼 사용할 수 있어요</p>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground mt-0.5">
          <X size={16} />
        </button>
      </div>

      {isIos ? (
        <div className="text-xs text-muted-foreground bg-muted rounded-xl p-2.5 space-y-1">
          <p className="flex items-center gap-1">
            <Share size={12} className="inline" /> Safari 하단 공유 버튼 탭
          </p>
          <p>→ <strong>"홈 화면에 추가"</strong> 선택</p>
        </div>
      ) : (
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition"
        >
          <Download size={14} />
          홈화면에 추가
        </button>
      )}
    </div>
  );
}
