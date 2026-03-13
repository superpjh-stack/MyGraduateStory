import { getAnalytics } from "@/lib/actions/analytics";
import { EMOTION_LABELS } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function generateSummary(data: NonNullable<Awaited<ReturnType<typeof getAnalytics>>["data"]>): string[] {
  const lines: string[] = [];
  const { totalSessions, totalReflections, totalKeywords, emotionData, topKeywords, weeks } = data;

  if (totalSessions === 0) return ["아직 기록된 수업이 없어요. 첫 번째 수업을 기록해보세요!"];

  lines.push(`총 ${totalSessions}회의 수업을 기록하고 ${totalKeywords}개의 키워드를 쌓았어요.`);

  if (totalReflections > 0) {
    lines.push(`${totalReflections}회의 주간 회고를 통해 꾸준히 자신을 돌아봤어요.`);
  }

  const recordedWeeks = weeks.filter((w) => w.recorded).length;
  const recordingRate = Math.round((recordedWeeks / weeks.length) * 100);
  if (recordingRate >= 80) {
    lines.push(`최근 26주 중 ${recordedWeeks}주를 기록해 ${recordingRate}%의 훌륭한 기록률을 유지하고 있어요.`);
  } else if (recordingRate >= 50) {
    lines.push(`최근 26주 중 ${recordedWeeks}주를 기록했어요. 꾸준히 기록하면 더 선명한 성장 이야기가 만들어질 거예요.`);
  } else {
    lines.push(`기록하는 습관을 조금 더 키워보면 어떨까요? 꾸준한 기록이 성장의 가장 좋은 친구예요.`);
  }

  if (emotionData.length > 0) {
    const top = emotionData[0];
    const label = EMOTION_LABELS[top.emotion] ?? top.emotion;
    lines.push(`가장 자주 느낀 감정은 '${label}'(${top.pct}%)로, 학습에 열정적으로 임하는 모습이 보여요.`);
  }

  if (topKeywords.length >= 3) {
    const kwStr = topKeywords.slice(0, 3).map((k) => `'${k.word}'`).join(", ");
    lines.push(`가장 많이 등장한 키워드는 ${kwStr}으로, 이 개념들이 학습의 중심이 되고 있어요.`);
  }

  lines.push(`지금 이 순간도 성장 중이에요. 오늘의 배움도 기록해보세요!`);

  return lines;
}

export default async function AiSummaryPage() {
  const res = await getAnalytics();
  const data = res.data;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        데이터를 불러올 수 없어요
      </div>
    );
  }

  const summaryLines = generateSummary(data);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">AI 학습 요약 ✨</h1>
        <p className="text-sm text-muted-foreground mt-0.5">기록을 바탕으로 분석한 나의 학습 이야기</p>
      </div>

      {/* 요약 카드 */}
      <div className="bg-gradient-to-br from-forest-50 to-moss-50 border border-forest-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-forest-600" />
          <h2 className="font-semibold text-sm text-forest-800">나의 학습 이야기</h2>
        </div>
        <div className="space-y-3">
          {summaryLines.map((line, i) => (
            <p key={i} className="text-sm text-forest-900 leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="bg-card rounded-2xl border p-5 space-y-4">
        <h2 className="font-semibold text-sm">핵심 지표 요약</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">총 수업 기록</p>
            <p className="text-xl font-bold text-forest-700">{data.totalSessions}회</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">총 키워드</p>
            <p className="text-xl font-bold text-forest-700">{data.totalKeywords}개</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">주간 회고</p>
            <p className="text-xl font-bold text-forest-700">{data.totalReflections}회</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">평균 감정 강도</p>
            <p className="text-xl font-bold text-forest-700">{data.avgIntensity}/5</p>
          </div>
        </div>
      </div>

      {/* 상위 감정 */}
      {data.emotionData.length > 0 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold text-sm">감정 패턴 분석</h2>
          <div className="space-y-2">
            {data.emotionData.slice(0, 5).map((e) => (
              <div key={e.emotion} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {EMOTION_LABELS[e.emotion] ?? e.emotion}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-forest-500 rounded-full"
                      style={{ width: `${e.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{e.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 상위 키워드 */}
      {data.topKeywords.length > 0 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold text-sm">자주 등장한 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {data.topKeywords.map((kw, i) => (
              <span
                key={kw.word}
                className="text-xs px-2.5 py-1 rounded-full border bg-muted/50"
                style={{
                  fontSize: Math.max(10, Math.min(14, 10 + (kw.count / data.topKeywords[0].count) * 5)),
                }}
              >
                {kw.word}
                <span className="ml-1 text-muted-foreground">{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-muted/50 rounded-xl p-3 text-center space-y-0.5">
        <p className="text-xs text-muted-foreground">
          이 요약은 기록된 데이터를 분석하여 자동 생성됩니다
        </p>
        <p className="text-[10px] text-muted-foreground">
          (외부 AI API 미사용 · 로컬 데이터 기반 분석)
        </p>
      </div>
    </div>
  );
}
