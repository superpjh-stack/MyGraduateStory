"use client";

import { useState, useTransition } from "react";
import { openCapsule } from "@/lib/actions/capsule";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Capsule {
  id: string;
  message: string;
  written_at: string;
  open_at: string;
  is_opened: boolean;
  opened_at: string | null;
}

export function CapsuleList({ capsules }: { capsules: Capsule[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (capsules.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border">
        <div className="text-3xl mb-2">⏳</div>
        <p className="text-sm">아직 타임캡슐이 없어요</p>
        <p className="text-xs mt-1">미래의 나에게 편지를 써보세요</p>
      </div>
    );
  }

  const now = new Date();

  const handleOpen = (id: string) => {
    startTransition(async () => {
      await openCapsule(id);
      setRevealed((prev) => new Set(Array.from(prev).concat(id)));
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        타임캡슐 목록
      </h2>
      {capsules.map((c) => {
        const canOpen = new Date(c.open_at) <= now;
        const isRevealed = c.is_opened || revealed.has(c.id);

        return (
          <div
            key={c.id}
            className={`bg-card rounded-2xl border p-4 space-y-2 ${
              canOpen && !isRevealed ? "border-warm-300 bg-warm-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{isRevealed ? "✉️" : "🔒"}</span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(c.written_at, "yyyy년 M월 d일")} 작성
                  </p>
                  <p className={`text-xs font-medium ${canOpen ? "text-warm-700" : "text-muted-foreground"}`}>
                    {canOpen ? "✨ 열어볼 수 있어요!" : `${formatDate(c.open_at, "yyyy년 M월 d일")} 공개`}
                  </p>
                </div>
              </div>
              {canOpen && !isRevealed && (
                <button
                  onClick={() => handleOpen(c.id)}
                  disabled={isPending}
                  className="text-xs bg-warm-500 text-white px-3 py-1.5 rounded-full hover:bg-warm-600 transition disabled:opacity-50"
                >
                  열기
                </button>
              )}
            </div>

            {isRevealed && (
              <div className="bg-background rounded-xl p-3 border border-forest-100">
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif text-foreground/80">
                  {c.message}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
