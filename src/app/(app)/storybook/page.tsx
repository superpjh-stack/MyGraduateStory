import { getStorybookData } from "@/lib/actions/storybook";
import { EMOTION_LABELS } from "@/lib/utils";
import { BookOpen, Sparkles, Star } from "lucide-react";

const EMOTION_EMOJI: Record<string, string> = {
  focused: "🎯", curious: "🤔", proud: "🌟", confused: "😵",
  excited: "🎉", tired: "😴", anxious: "😰", satisfied: "😊",
};

export default async function StorybookPage() {
  const res = await getStorybookData();
  const data = res.data;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        데이터를 불러올 수 없어요
      </div>
    );
  }

  const { chapters, totalSessions, totalReflections, totalKeywords, topKeywords, achievements, latestGrowthIndex, latestTreeLevel, profile } = data;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold">졸업 스토리북 📖</h1>
        <p className="text-sm text-muted-foreground mt-0.5">나의 석사 여정을 한 권의 책으로</p>
      </div>

      {/* 표지 */}
      <div className="bg-gradient-to-br from-forest-50 to-moss-50 border border-forest-200 rounded-2xl p-6 text-center space-y-3">
        <div className="text-5xl mb-2">🌳</div>
        <h2 className="text-2xl font-bold text-forest-800">
          {profile?.name ? `${profile.name}의 석사 이야기` : "나의 석사 이야기"}
        </h2>
        {profile?.semester_start_date && (
          <p className="text-sm text-forest-600">
            {profile.semester_start_date.substring(0, 7).replace("-", "년 ")}월 시작
          </p>
        )}
        <div className="flex justify-center gap-6 pt-2 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-forest-700">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">수업 기록</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-forest-700">{totalReflections}</div>
            <div className="text-xs text-muted-foreground">회고</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-forest-700">{totalKeywords}</div>
            <div className="text-xs text-muted-foreground">키워드</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-forest-700">Lv.{latestTreeLevel}</div>
            <div className="text-xs text-muted-foreground">성장 레벨</div>
          </div>
        </div>
      </div>

      {/* 챕터 목록 */}
      {chapters.length === 0 ? (
        <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground">
          <div className="text-4xl mb-3">🌱</div>
          <p className="font-medium">아직 스토리가 없어요</p>
          <p className="text-sm mt-1">수업을 기록하면 챕터가 생성돼요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch) => (
            <div key={ch.month} className="bg-card rounded-2xl border p-5 space-y-3">
              {/* 챕터 헤더 */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center shrink-0">
                  <span className="text-forest-700 font-bold text-sm">Ch.{ch.chapterNum}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{ch.title}</h3>
                    {ch.topEmotion && (
                      <span className="text-base">{EMOTION_EMOJI[ch.topEmotion] ?? "📝"}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {ch.month.replace("-", "년 ")}월 ·{" "}
                    수업 {ch.sessionCount}회
                    {ch.reflectionCount > 0 && ` · 회고 ${ch.reflectionCount}회`}
                  </p>
                </div>
              </div>

              {/* 과목 태그 */}
              {ch.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {ch.subjects.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* 하이라이트 */}
              {ch.highlights.length > 0 && (
                <div className="space-y-1.5">
                  {ch.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <BookOpen size={14} className="text-forest-500 mt-0.5 shrink-0" />
                      <p className="text-foreground line-clamp-2">{h}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 나에게 보내는 말 */}
              {ch.selfMessages.length > 0 && (
                <div className="bg-warm-50 border border-warm-200 rounded-xl p-3">
                  <p className="text-xs font-serif italic text-warm-700">
                    &ldquo;{ch.selfMessages[0]}&rdquo;
                  </p>
                </div>
              )}

              {/* 키워드 */}
              {ch.topKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {ch.topKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-0.5 bg-forest-50 text-forest-700 border border-forest-200 rounded-full"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 전체 키워드 */}
      {topKeywords.length > 0 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles size={14} className="text-warm-500" />
            나의 핵심 키워드
          </h2>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((kw, i) => (
              <span
                key={kw.word}
                className="text-xs px-3 py-1.5 rounded-full border"
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

      {/* 획득한 배지 */}
      {achievements.length > 0 && (
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Star size={14} className="text-yellow-500" />
            획득한 배지
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <span className="text-lg">🏆</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-yellow-800 truncate">{ach.title}</p>
                  <p className="text-[10px] text-yellow-600 truncate">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
