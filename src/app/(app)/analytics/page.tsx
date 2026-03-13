import { getAnalytics } from "@/lib/actions/analytics";
import { MonthlySessionsChart } from "@/components/analytics/monthly-sessions-chart";
import { GrowthTrendChart } from "@/components/analytics/growth-trend-chart";
import { EMOTION_LABELS } from "@/lib/utils";

const EMOTION_COLORS: Record<string, string> = {
  focused: "#2563eb", curious: "#9333ea", proud: "#16a34a", confused: "#dc2626",
  excited: "#ea580c", tired: "#6b7280", anxious: "#be185d", satisfied: "#0891b2",
};

export default async function AnalyticsPage() {
  const res = await getAnalytics();
  const data = res.data;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        데이터를 불러올 수 없어요
      </div>
    );
  }

  const {
    totalSessions, totalReflections, totalKeywords, avgIntensity,
    monthlySessions, emotionData, subjectData, topKeywords, weeks, growthTrend,
  } = data;

  const recordedWeeks = weeks.filter((w) => w.recorded).length;
  const recordingRate = weeks.length > 0 ? Math.round((recordedWeeks / weeks.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">성장 분석 📊</h1>
        <p className="text-sm text-muted-foreground mt-0.5">나의 학습 여정을 숫자로</p>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "총 수업", value: totalSessions, unit: "회" },
          { label: "총 회고", value: totalReflections, unit: "회" },
          { label: "총 키워드", value: totalKeywords, unit: "개" },
          { label: "기록률", value: recordingRate, unit: "%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl border p-4 text-center">
            <div className="text-2xl font-bold text-forest-700">
              {stat.value}
              <span className="text-base font-normal text-muted-foreground ml-0.5">{stat.unit}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 월별 수업 수 */}
      {monthlySessions.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">월별 수업 기록</h2>
          <MonthlySessionsChart data={monthlySessions} />
        </div>
      )}

      {/* 성장 지수 추이 */}
      {growthTrend.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">성장 지수 추이</h2>
          <GrowthTrendChart data={growthTrend} />
        </div>
      )}

      {/* 주간 기록 현황 */}
      <div className="bg-card rounded-2xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">26주 기록 현황</h2>
          <span className="text-xs text-muted-foreground">
            {recordedWeeks}/{weeks.length}주
          </span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {weeks.map((w) => (
            <div
              key={w.week}
              title={`${w.week}: ${w.recorded ? "기록함" : "미기록"}`}
              className={`w-5 h-5 rounded-sm ${w.recorded ? "bg-forest-500" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">초록색: 기록한 주</p>
      </div>

      {/* 감정 분포 */}
      {emotionData.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">감정 분포</h2>
          <div className="space-y-2">
            {emotionData.map((e) => (
              <div key={e.emotion} className="flex items-center gap-3">
                <span className="text-xs w-16 text-right text-muted-foreground shrink-0">
                  {EMOTION_LABELS[e.emotion] ?? e.emotion}
                </span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${e.pct}%`,
                      backgroundColor: EMOTION_COLORS[e.emotion] ?? "#6b7280",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 shrink-0">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 과목별 분포 */}
      {subjectData.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">과목별 수업 수</h2>
          <div className="space-y-2">
            {subjectData.slice(0, 8).map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs w-24 truncate text-right text-muted-foreground shrink-0">
                  {s.name}
                </span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round((s.count / subjectData[0].count) * 100)}%`,
                      backgroundColor: s.color ?? "#16a34a",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 shrink-0">{s.count}회</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP 키워드 */}
      {topKeywords.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">TOP 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((kw) => (
              <span
                key={kw.word}
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{
                  fontSize: Math.max(10, Math.min(14, 10 + (kw.count / topKeywords[0].count) * 5)),
                }}
              >
                {kw.word}
                <span className="ml-1 text-muted-foreground">{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
