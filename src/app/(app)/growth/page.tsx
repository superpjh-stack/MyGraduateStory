import { createClient } from "@/lib/supabase/server";
import { getGrowthSnapshot, getGrowthHistory, getAchievements, getHeatmapData, getEmotionStats } from "@/lib/actions/growth";
import { GrowthTree } from "@/components/growth/growth-tree";
import { GrowthChart } from "@/components/growth/growth-chart";
import { CalendarHeatmap } from "@/components/growth/calendar-heatmap";
import { EmotionFlowChart } from "@/components/growth/emotion-flow-chart";
import { growthIndexToTreeLevel, TREE_LEVEL_NAMES, formatDate } from "@/lib/utils";

export default async function GrowthPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [snapshotRes, historyRes, achievementsRes, heatmapRes, emotionRes] = await Promise.all([
    getGrowthSnapshot(),
    getGrowthHistory(),
    getAchievements(),
    getHeatmapData(52),
    getEmotionStats(),
  ]);

  const snapshot = snapshotRes.data as any;
  const history = (historyRes.data ?? []) as any[];
  const achievements = (achievementsRes.data ?? []) as any[];
  const heatmapData = (heatmapRes.data ?? []) as any[];
  const emotionStats = (emotionRes.data ?? []) as any[];

  const growthIndex = snapshot?.growth_index ?? 0;
  const treeLevel = snapshot?.tree_level ?? growthIndexToTreeLevel(growthIndex);
  const season = snapshot?.season ?? "spring";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">성장 나무 🌳</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {TREE_LEVEL_NAMES[treeLevel]}으로 성장 중
        </p>
      </div>

      {/* 나무 */}
      <div className="bg-gradient-to-br from-forest-50 via-background to-moss-50 rounded-2xl border p-6">
        <GrowthTree level={treeLevel} growthIndex={growthIndex} season={season} />
      </div>

      {/* 수업 기록 히트맵 */}
      <div className="bg-card rounded-2xl border p-4 space-y-3">
        <div>
          <h2 className="font-semibold text-sm">수업 기록 히트맵</h2>
          <p className="text-xs text-muted-foreground mt-0.5">최근 52주 수업 기록 현황</p>
        </div>
        <CalendarHeatmap data={heatmapData} weeks={52} />
      </div>

      {/* 감정 분포 */}
      <div className="bg-card rounded-2xl border p-4 space-y-3">
        <div>
          <h2 className="font-semibold text-sm">감정 흐름</h2>
          <p className="text-xs text-muted-foreground mt-0.5">수업별 감정 분포</p>
        </div>
        <EmotionFlowChart data={emotionStats} />
      </div>

      {/* 성장 그래프 */}
      {history.length > 1 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">성장 지수 추이</h2>
          <GrowthChart data={history} />
        </div>
      )}

      {/* 성장 수치 */}
      {snapshot && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "수업", value: snapshot.total_sessions, unit: "회" },
            { label: "키워드", value: snapshot.total_keywords, unit: "개" },
            { label: "회고", value: snapshot.total_reflections, unit: "회" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-card rounded-2xl border p-3 text-center">
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label} {unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* 배지 */}
      {achievements.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            획득 배지
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div key={a.id} className="bg-card rounded-2xl border p-3 space-y-1">
                <div className="text-2xl">🏅</div>
                <div className="text-sm font-medium">{a.title}</div>
                {a.description && (
                  <div className="text-xs text-muted-foreground">{a.description}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {formatDate(a.earned_at, "M/d")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length === 0 && (
        <div className="text-center py-6 text-muted-foreground bg-card rounded-2xl border">
          <div className="text-3xl mb-2">🏅</div>
          <p className="text-sm">배지를 모아보세요!</p>
          <p className="text-xs mt-1">수업을 꾸준히 기록하면 배지가 지급돼요</p>
        </div>
      )}
    </div>
  );
}
