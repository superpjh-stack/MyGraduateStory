import { getCurrentWeekReflection, getReflections, getMonthlyStats } from "@/lib/actions/reflections";
import { ReflectionForm } from "@/components/reflection/reflection-form";
import { formatDate, getWeekNumber, EMOTION_LABELS } from "@/lib/utils";

export default async function ReflectPage() {
  const now = new Date();
  const [currentRes, historyRes, monthlyRes] = await Promise.all([
    getCurrentWeekReflection(),
    getReflections(8),
    getMonthlyStats(now.getFullYear(), now.getMonth() + 1),
  ]);

  const current = currentRes.data as any;
  const history = ((historyRes.data ?? []) as any[]).filter(
    (r) => !current || r.id !== current.id
  );
  const monthly = monthlyRes.data;
  const weekNumber = getWeekNumber();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">주간 회고</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{weekNumber}주차 · 배움을 되새기는 시간</p>
      </div>

      <ReflectionForm initialData={current ?? undefined} weekNumber={weekNumber} />

      {/* 이번 달 요약 */}
      {monthly && (
        <div className="bg-gradient-to-br from-forest-50 to-moss-50 rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">📅 {monthly.month} 요약</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-forest-700">{monthly.totalSessions}</div>
              <div className="text-xs text-muted-foreground">수업 기록</div>
            </div>
            <div className="bg-white/60 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-forest-700">{monthly.totalReflections}</div>
              <div className="text-xs text-muted-foreground">회고</div>
            </div>
          </div>
          {monthly.topKeywords.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">이번 달 핵심 키워드</p>
              <div className="flex flex-wrap gap-1.5">
                {monthly.topKeywords.map(({ word, count }: { word: string; count: number }) => (
                  <span key={word} className="text-xs bg-forest-100 text-forest-700 rounded-full px-2.5 py-1">
                    {word} <span className="opacity-60">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {monthly.topEmotion && (
            <p className="text-xs text-muted-foreground">
              이번 달 주요 감정: <span className="font-medium text-foreground">{EMOTION_LABELS[monthly.topEmotion]}</span>
            </p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            지난 회고
          </h2>
          {history.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.year}년 {r.week_number}주차</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(r.created_at, "M월 d일")}
                </span>
              </div>
              {r.summary && (
                <p className="text-sm text-foreground/80 line-clamp-3">{r.summary}</p>
              )}
              {r.top_learnings?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.top_learnings.slice(0, 3).map((kw: string, i: number) => (
                    <span key={i} className="text-xs bg-forest-50 text-forest-700 rounded-full px-2 py-0.5">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
              {r.self_message && (
                <p className="text-xs text-muted-foreground font-serif italic border-l-2 border-forest-200 pl-2">
                  "{r.self_message}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
