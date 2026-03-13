"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { createSubject } from "@/lib/actions/subjects";
import { useRouter } from "next/navigation";

const SUBJECT_COLORS = [
  "#16a34a", "#2563eb", "#9333ea", "#dc2626",
  "#ea580c", "#0891b2", "#be185d", "#4f46e5",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [semesterStart, setSemesterStart] = useState("");
  const [subjects, setSubjects] = useState([
    { name: "", color: SUBJECT_COLORS[0] },
  ]);

  const addSubjectRow = () => {
    setSubjects((prev) => [
      ...prev,
      { name: "", color: SUBJECT_COLORS[prev.length % SUBJECT_COLORS.length] },
    ]);
  };

  const handleFinish = () => {
    startTransition(async () => {
      // 1) 프로필 업데이트
      await updateProfile({
        displayName: displayName || undefined,
        semesterStartDate: semesterStart || undefined,
        onboardingCompleted: true,
      });

      // 2) 과목 생성
      for (const s of subjects.filter((s) => s.name.trim())) {
        await createSubject({ name: s.name.trim(), color: s.color });
      }

      router.push("/dashboard");
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🌱</div>
          <h1 className="text-2xl font-bold">MyGraduate 시작하기</h1>
          <p className="text-sm text-muted-foreground">
            당신의 대학원 여정을 함께 기록할게요
          </p>
        </div>

        {/* 단계 표시 */}
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold">기본 정보를 입력해주세요</h2>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">이름 (닉네임)</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="예: Gerardo"
                className="w-full border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">학기 시작일</label>
              <input
                type="date"
                value={semesterStart}
                onChange={(e) => setSemesterStart(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-forest-600 transition"
            >
              다음
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold">수강 과목을 추가해주세요</h2>
            <p className="text-xs text-muted-foreground -mt-3">나중에 언제든지 수정할 수 있어요</p>

            <div className="space-y-3">
              {subjects.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-full shrink-0 cursor-pointer border-2 border-background shadow-sm"
                    style={{ background: s.color }}
                    onClick={() => {
                      const nextColor = SUBJECT_COLORS[(SUBJECT_COLORS.indexOf(s.color) + 1) % SUBJECT_COLORS.length];
                      setSubjects((prev) => prev.map((sub, idx) => idx === i ? { ...sub, color: nextColor } : sub));
                    }}
                  />
                  <input
                    value={s.name}
                    onChange={(e) => setSubjects((prev) => prev.map((sub, idx) => idx === i ? { ...sub, name: e.target.value } : sub))}
                    placeholder={`과목명 ${i + 1}`}
                    className="flex-1 border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubjectRow}
              className="w-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground text-sm py-2.5 rounded-xl hover:bg-muted transition"
            >
              + 과목 추가
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted transition"
              >
                이전
              </button>
              <button
                onClick={handleFinish}
                disabled={isPending}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-forest-600 transition disabled:opacity-50"
              >
                {isPending ? "시작 중..." : "시작하기 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
