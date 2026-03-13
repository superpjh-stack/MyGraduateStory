"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mic, MicOff, Zap } from "lucide-react";
import { createSession } from "@/lib/actions/sessions";
import { Subject } from "@/types/database";
import { cn } from "@/lib/utils";
import { useNetworkStatus } from "@/hooks/use-network-status";

// Web Speech API 타입
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface QuickCaptureProps {
  subjects: Subject[];
  open: boolean;
  onClose: () => void;
}

export function QuickCapture({ subjects, open, onClose }: QuickCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [isListening, setIsListening] = useState(false);
  const { isOnline } = useNetworkStatus();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const isSpeechSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // 열릴 때 textarea 자동 포커스
  useEffect(() => {
    if (open) {
      setNote("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  // ESC 키 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function startVoice() {
    if (!isSpeechSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setNote((prev) => prev + transcript);
    };
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !subjectId) return;
    setLoading(true);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const hour = today.getHours();
    const dayType =
      dayOfWeek === 5
        ? "friday_evening"
        : hour < 12
        ? "saturday_morning"
        : hour < 17
        ? "saturday_afternoon"
        : "saturday_evening";

    const keywords = note
      .split(/[\s,]+/)
      .filter((w) => w.length > 1)
      .slice(0, 5);

    try {
      if (isOnline) {
        await createSession({
          subjectId,
          sessionDate: today.toISOString().split("T")[0],
          dayType,
          learned: note,
          keywords,
          isQuickCapture: true,
        });
      } else {
        // 오프라인: localStorage 임시 저장
        const offline = JSON.parse(localStorage.getItem("offline_captures") ?? "[]");
        offline.push({
          subjectId,
          sessionDate: today.toISOString().split("T")[0],
          dayType,
          learned: note,
          keywords,
          isQuickCapture: true,
          savedAt: today.toISOString(),
        });
        localStorage.setItem("offline_captures", JSON.stringify(offline));
      }
    } finally {
      setLoading(false);
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* 딤 배경 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div className="relative w-full bg-card rounded-t-2xl shadow-2xl pb-safe animate-slide-up">
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              <Zap size={17} className="text-primary" />
              빠른 메모
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 과목 선택 */}
            {subjects.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubjectId(s.id)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition min-h-[36px]",
                      subjectId === s.id
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-foreground border-border"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {/* 텍스트 영역 */}
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="지금 배운 것, 떠오른 생각을 빠르게 적어요"
              rows={4}
              className="w-full rounded-xl border bg-background px-4 py-3 text-[17px] leading-relaxed outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />

            {/* 액션 버튼 행 */}
            <div className="flex gap-2">
              {/* 음성 입력 버튼 */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopVoice : startVoice}
                  className={cn(
                    "w-12 h-12 rounded-xl border flex items-center justify-center transition-colors shrink-0",
                    isListening
                      ? "bg-red-500 text-white border-red-500 animate-pulse"
                      : "bg-background border-border hover:bg-muted"
                  )}
                  title={isListening ? "음성 입력 중단" : "음성으로 입력"}
                >
                  {isListening ? <MicOff size={19} /> : <Mic size={19} />}
                </button>
              )}

              {/* 저장 버튼 */}
              <button
                type="submit"
                disabled={loading || !note.trim()}
                className="flex-1 h-12 bg-primary text-white rounded-xl text-[15px] font-semibold hover:bg-primary/90 transition disabled:opacity-50 active:scale-[0.98]"
              >
                {loading
                  ? "저장 중..."
                  : isOnline
                  ? "저장하기 ⚡"
                  : "저장 (오프라인)"}
              </button>
            </div>

            {/* 오프라인 안내 */}
            {!isOnline && (
              <p className="text-xs text-center text-muted-foreground">
                현재 오프라인 · 연결되면 자동으로 동기화됩니다
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
