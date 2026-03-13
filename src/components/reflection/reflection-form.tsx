"use client";

import { useState } from "react";
import { createOrUpdateReflection } from "@/lib/actions/reflections";
import { Reflection } from "@/types/database";
import { X } from "lucide-react";

interface ReflectionFormProps {
  initialData?: Reflection;
  weekNumber: number;
}

export function ReflectionForm({ initialData, weekNumber }: ReflectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [topLearnings, setTopLearnings] = useState<string[]>(initialData?.top_learnings ?? []);
  const [learning, setLearning] = useState("");
  const [emotionSummary, setEmotionSummary] = useState(initialData?.emotion_summary ?? "");
  const [nextWeekGoal, setNextWeekGoal] = useState(initialData?.next_week_goal ?? "");
  const [selfMessage, setSelfMessage] = useState(initialData?.self_message ?? "");

  function addLearning() {
    const kw = learning.trim();
    if (kw && !topLearnings.includes(kw)) {
      setTopLearnings((prev) => [...prev, kw]);
      setLearning("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await createOrUpdateReflection({
      weekNumber,
      summary,
      topLearnings,
      emotionSummary: emotionSummary || undefined,
      nextWeekGoal: nextWeekGoal || undefined,
      selfMessage: selfMessage || undefined,
    });

    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{weekNumber}주차 회고</h2>
        {saved && (
          <span className="text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full animate-pulse">
            저장됨 ✓
          </span>
        )}
      </div>

      {/* 이번 주 요약 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">이번 주 요약</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="이번 주 어떤 한 주였나요?"
          rows={3}
          className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* 핵심 배움 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">이번 주 핵심 배움</label>
        <div className="flex gap-2">
          <input
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearning())}
            placeholder="핵심 배움 입력 후 Enter"
            className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={addLearning}
            className="px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-forest-600 transition"
          >
            추가
          </button>
        </div>
        {topLearnings.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topLearnings.map((kw, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-forest-50 text-forest-700 text-xs rounded-full px-2.5 py-1"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => setTopLearnings((prev) => prev.filter((_, j) => j !== i))}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 감정 요약 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">이번 주 감정 요약 (선택)</label>
        <input
          value={emotionSummary}
          onChange={(e) => setEmotionSummary(e.target.value)}
          placeholder="이번 주 전반적인 감정은?"
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* 다음 주 목표 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">다음 주 목표 (선택)</label>
        <input
          value={nextWeekGoal}
          onChange={(e) => setNextWeekGoal(e.target.value)}
          placeholder="다음 주에 꼭 하고 싶은 것"
          className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* 나에게 한마디 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">미래의 나에게 한마디 (선택)</label>
        <textarea
          value={selfMessage}
          onChange={(e) => setSelfMessage(e.target.value)}
          placeholder="1년 후의 나에게 전하고 싶은 말"
          rows={2}
          className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none font-serif"
        />
      </div>

      <button
        type="submit"
        disabled={loading || (!summary && topLearnings.length === 0)}
        className="w-full bg-primary text-white rounded-xl py-3 font-medium hover:bg-forest-600 transition disabled:opacity-50"
      >
        {loading ? "저장 중..." : initialData ? "회고 업데이트 ✨" : "회고 저장하기 ✨"}
      </button>
    </form>
  );
}
