"use client";

import { useState, useTransition } from "react";
import { createAssessment } from "@/lib/actions/assessment";
import { useRouter } from "next/navigation";
import { AssessmentType } from "@/types/database";

interface Question {
  id: string;
  label: string;
  scale: number;
}

export function AssessmentForm({
  type,
  questions,
}: {
  type: AssessmentType;
  questions: Question[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(questions.map((q) => [q.id, 3]))
  );
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    startTransition(async () => {
      await createAssessment({ assessmentType: type, responses: scores });
      setOpen(false);
      router.refresh();
    });
  };

  const typeLabel =
    type === "initial" ? "입학 자가진단" : type === "final" ? "졸업 자가진단" : "이번 달 자가진단";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-forest-200 text-forest-700 py-4 rounded-2xl text-sm font-medium hover:bg-forest-50 transition"
      >
        + {typeLabel} 작성하기
      </button>
    );
  }

  return (
    <div className="bg-card rounded-2xl border p-4 space-y-5">
      <h2 className="font-semibold text-sm">{typeLabel}</h2>
      <p className="text-xs text-muted-foreground -mt-3">1(매우 낮음) ~ 5(매우 높음)</p>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="space-y-2">
            <label className="text-sm">{q.label}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setScores((prev) => ({ ...prev, [q.id]: v }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    scores[q.id] === v
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 border border-border py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-forest-600 transition disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
