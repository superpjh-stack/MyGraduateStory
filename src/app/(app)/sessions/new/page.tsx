"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/actions/sessions";
import { DayType, EmotionType } from "@/types/database";
import { EMOTION_LABELS, DAY_TYPE_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { useEffect } from "react";

const SUBJECT_COLORS = ["#2D5A3D", "#1A6FFF", "#E64A19", "#7B1FA2", "#00897B", "#F57C00"];

export default function NewSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; name: string; color: string }[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [dayType, setDayType] = useState<DayType>("friday_evening");
  const [learned, setLearned] = useState("");
  const [felt, setFelt] = useState("");
  const [emotionType, setEmotionType] = useState<EmotionType | "">("");
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => {
        setSubjects(data ?? []);
        if (data?.length) setSubjectId(data[0].id);
      })
      .catch(() => {});
  }, []);

  function addKeyword() {
    const kw = keyword.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
      setKeyword("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) return;
    setLoading(true);

    await createSession({
      subjectId,
      sessionDate,
      dayType,
      learned: learned || undefined,
      felt: felt || undefined,
      emotionType: (emotionType as EmotionType) || undefined,
      emotionIntensity: emotionType ? emotionIntensity : undefined,
      keywords,
    });

    router.push("/sessions");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/sessions" className="p-2 rounded-xl hover:bg-muted transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">새 수업 기록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 과목 선택 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">과목</label>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              먼저{" "}
              <Link href="/subjects" className="text-primary underline">
                과목을 등록
              </Link>
              해주세요.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubjectId(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border transition",
                    subjectId === s.id
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-background"
                  )}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 날짜 & 타입 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">날짜</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">시간대</label>
            <select
              value={dayType}
              onChange={(e) => setDayType(e.target.value as DayType)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Object.entries(DAY_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 배운 것 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">오늘 배운 것</label>
          <textarea
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            placeholder="오늘 수업에서 배운 핵심 내용을 기록해요"
            rows={4}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* 느낀 것 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">느낀 것 (선택)</label>
          <textarea
            value={felt}
            onChange={(e) => setFelt(e.target.value)}
            placeholder="수업 후 느낀 감정이나 생각"
            rows={2}
            className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* 감정 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">감정 온도</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(EMOTION_LABELS) as [EmotionType, string][]).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => setEmotionType(emotionType === type ? "" : type)}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-full border transition",
                  emotionType === type
                    ? "bg-warm-100 border-warm-400 text-warm-800"
                    : "bg-background border-border"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {emotionType && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>강도</span>
                <span>{emotionIntensity}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={emotionIntensity}
                onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}
        </div>

        {/* 키워드 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">키워드</label>
          <div className="flex gap-2">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
              placeholder="Enter로 추가"
              className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={addKeyword}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-forest-600 transition"
            >
              추가
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1 bg-forest-50 text-forest-700 text-xs rounded-full px-2.5 py-1"
                >
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="hover:text-forest-900">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !subjectId}
          className="w-full bg-primary text-white rounded-xl py-3 font-medium hover:bg-forest-600 transition disabled:opacity-50"
        >
          {loading ? "저장 중..." : "기록 저장하기 🌱"}
        </button>
      </form>
    </div>
  );
}
