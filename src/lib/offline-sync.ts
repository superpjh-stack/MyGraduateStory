"use client";

import { createSession } from "@/lib/actions/sessions";
import { DayType } from "@/types/database";

export const OFFLINE_KEY = "offline_captures";

interface OfflineCapture {
  subjectId: string;
  sessionDate: string;
  dayType: DayType;
  learned: string;
  keywords: string[];
  isQuickCapture: boolean;
  savedAt: string;
}

export function getOfflineCaptures(): OfflineCapture[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getOfflineCaptureCount(): number {
  return getOfflineCaptures().length;
}

function saveOfflineCaptures(captures: OfflineCapture[]): void {
  if (captures.length === 0) {
    localStorage.removeItem(OFFLINE_KEY);
  } else {
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(captures));
  }
}

export async function syncOfflineCaptures(): Promise<number> {
  const captures = getOfflineCaptures();
  if (captures.length === 0) return 0;

  let synced = 0;
  const remaining: OfflineCapture[] = [];

  for (const capture of captures) {
    try {
      const { subjectId, sessionDate, dayType, learned, keywords, isQuickCapture } = capture;
      await createSession({ subjectId, sessionDate, dayType, learned, keywords, isQuickCapture });
      synced++;
    } catch {
      remaining.push(capture); // 실패 항목 보존 (다음 재시도)
    }
  }

  saveOfflineCaptures(remaining);
  return synced;
}
