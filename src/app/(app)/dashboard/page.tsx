import { createClient } from "@/lib/supabase/server";
import { getSessions, getSessionStats } from "@/lib/actions/sessions";
import { getGrowthSnapshot, refreshGrowthSnapshot } from "@/lib/actions/growth";
import { getCurrentWeekReflection } from "@/lib/actions/reflections";
import { getSubjects } from "@/lib/actions/subjects";
import { WeeklyStats } from "@/components/dashboard/weekly-stats";
import { SessionCard } from "@/components/session/session-card";
import { GrowthTree } from "@/components/growth/growth-tree";
import { getSemesterWeek, growthIndexToTreeLevel } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 백그라운드에서 성장 지수 스냅샷을 갱신하고 최신 데이터를 병렬로 조회
  const [
    profileRes,
    sessionsRes,
    statsRes,
    growthRes,
    reflectionRes,
    subjectsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    getSessions(3),
    getSessionStats(user.id),
    refreshGrowthSnapshot().catch(() => getGrowthSnapshot()),
    getCurrentWeekReflection(),
    getSubjects(),
  ]);

  const profile = profileRes.data as any;
  const recentSessions = (sessionsRes.data ?? []) as any[];
  const stats = statsRes.data ?? { totalSessions: 0, totalKeywords: 0, topKeywords: [] };
  const snapshot = growthRes.data as any;
  const subjects = subjectsRes.data ?? [];

  const growthIndex = snapshot?.growth_index ?? 0;
  const treeLevel = snapshot?.tree_level ?? growthIndexToTreeLevel(growthIndex);
  const season = snapshot?.season ?? "spring";
  const semesterWeek = profile?.semester_start_date
    ? getSemesterWeek(profile.semester_start_date)
    : 1;
  const hasReflectedThisWeek = !!reflectionRes.data;

  return (
    <div className="space-y-6">
      {/* 인사 */}
      <div className="pt-1">
        <h1 className="text-xl font-bold">
          안녕하세요, {profile?.display_name ?? "Gerardo"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          오늘도 한 걸음씩 성장하고 있어요
        </p>
      </div>

      {/* 성장 나무 미니 */}
      <div className="bg-gradient-to-br from-forest-50 to-moss-50 rounded-2xl border p-5">
        <GrowthTree level={treeLevel} growthIndex={growthIndex} season={season} />
      </div>

      {/* 통계 */}
      <WeeklyStats
        totalSessions={stats.totalSessions}
        totalKeywords={stats.totalKeywords}
        totalReflections={snapshot?.total_reflections ?? 0}
        streakWeeks={snapshot?.streak_weeks ?? 0}
        semesterWeek={semesterWeek}
      />

      {/* 이번 주 회고 알림 */}
      {!hasReflectedThisWeek && (
        <Link
          href="/reflect"
          className="block bg-warm-50 border border-warm-200 rounded-2xl p-4 hover:bg-warm-100 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-warm-800">✨ 이번 주 회고를 작성해보세요</div>
              <div className="text-xs text-warm-600 mt-0.5">배움을 되새기면 성장이 2배!</div>
            </div>
            <ChevronRight size={18} className="text-warm-500" />
          </div>
        </Link>
      )}

      {/* 최근 기록 */}
      {recentSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              최근 기록
            </h2>
            <Link href="/sessions" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {recentSessions.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-medium">아직 기록이 없어요</p>
          <p className="text-sm mt-1">첫 번째 수업을 기록해보세요!</p>
          <Link
            href="/sessions/new"
            className="inline-block mt-4 bg-primary text-white text-sm px-5 py-2 rounded-xl hover:bg-forest-600 transition"
          >
            첫 기록 남기기
          </Link>
        </div>
      )}

    </div>
  );
}
