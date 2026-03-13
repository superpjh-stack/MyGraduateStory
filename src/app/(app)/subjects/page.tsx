"use client";

import { useState, useEffect } from "react";
import { createSubject } from "@/lib/actions/subjects";
import { Subject } from "@/types/database";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#2D5A3D", "#1A6FFF", "#E64A19", "#7B1FA2", "#00897B", "#F57C00", "#C62828", "#37474F"];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [professor, setProfessor] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => {});
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const result = await createSubject({ name, professor, color, description }) as any;
    if (result.data) {
      setSubjects((prev) => [...prev, result.data as Subject]);
      setName(""); setProfessor(""); setDescription(""); setColor(COLORS[0]);
      setShowForm(false);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">과목 관리</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-forest-600 transition"
        >
          <Plus size={16} />
          과목 추가
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-2xl border p-4 space-y-3">
          <h3 className="font-medium text-sm">새 과목</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="과목명 *"
            required
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="교수님 이름 (선택)"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="과목 설명 (선택)"
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">색상</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition",
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border rounded-xl py-2 text-sm hover:bg-muted transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white rounded-xl py-2 text-sm hover:bg-forest-600 transition disabled:opacity-50"
            >
              {loading ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-medium">등록된 과목이 없어요</p>
          <p className="text-sm mt-1">수강 중인 과목을 추가해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((s) => (
            <div key={s.id} className="bg-card rounded-2xl border p-4 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{s.name}</div>
                {s.professor && (
                  <div className="text-xs text-muted-foreground">{s.professor} 교수님</div>
                )}
                {s.description && (
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{s.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
