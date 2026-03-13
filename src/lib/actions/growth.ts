"use server";

import { createClient } from "@/lib/supabase/server";
import { calcGrowthIndex, growthIndexToTreeLevel } from "@/lib/utils";

// ISO 주차 번호 계산 (월요일 시작 기준)
function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // 목요일 기준 연도/주차 결정 (ISO 8601)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - yearStart.getTime()) / 86400000 -
        3 +
        ((yearStart.getDay() + 6) % 7)) /
        7
    );
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// 연속 기록 주 수 계산 (현재 주 포함, 역순으로 연속된 주)
function calcStreakWeeks(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0;

  const weeks = new Set(sessionDates.map((d) => getISOWeekKey(new Date(d))));
  const thisWeekKey = getISOWeekKey(new Date());

  let streak = 0;
  const checkDate = new Date();
  // 이번 주부터 역순으로 확인
  while (true) {
    const key = getISOWeekKey(checkDate);
    if (weeks.has(key)) {
      streak++;
      // 7일 뒤로 이동 (이전 주)
      checkDate.setDate(checkDate.getDate() - 7);
    } else if (key === thisWeekKey) {
      // 이번 주에 기록이 없어도 지난 주로 넘어가서 계속 확인
      checkDate.setDate(checkDate.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
}

export async function getGrowthSnapshot() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 최신 스냅샷 조회
  const { data: snapshot, error } = await supabase
    .from("growth_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { error: error.message };
  return { data: snapshot };
}

export async function getGrowthHistory(limit = 52) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("growth_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: true })
    .limit(limit);

  if (error) return { error: error.message };
  return { data };
}

export async function refreshGrowthSnapshot() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 통계 집계
  const [sessionsRes, reflectionsRes] = await Promise.all([
    supabase.from("sessions").select("keywords, session_date").eq("user_id", user.id).is("archived_at", null),
    supabase.from("reflections").select("id").eq("user_id", user.id).is("archived_at", null),
  ]);

  const sessionRows = (sessionsRes.data ?? []) as any[];
  const totalSessions = sessionRows.length;
  const totalKeywords = sessionRows.reduce((acc: number, s: any) => acc + (s.keywords?.length ?? 0), 0);
  const totalReflections = reflectionsRes.data?.length ?? 0;

  // 연속 주 계산
  const sessionDates = sessionRows.map((s: any) => s.session_date).filter(Boolean) as string[];
  const streakWeeks = calcStreakWeeks(sessionDates);

  const growthIndex = calcGrowthIndex({
    totalSessions,
    totalKeywords,
    totalReflections,
    streakWeeks,
    selfAssessmentScore: 0,
  });

  const treeLevel = growthIndexToTreeLevel(growthIndex);

  const month = new Date().getMonth();
  const season =
    month < 3 ? "winter" :
    month < 6 ? "spring" :
    month < 9 ? "summer" : "autumn";

  const { data, error } = await supabase
    .from("growth_snapshots")
    .insert({
      user_id: user.id,
      snapshot_date: new Date().toISOString().split("T")[0],
      total_sessions: totalSessions,
      total_keywords: totalKeywords,
      total_reflections: totalReflections,
      streak_weeks: streakWeeks,
      growth_index: growthIndex,
      tree_level: treeLevel,
      season,
    } as any)
    .select()
    .single();

  if (error) return { error: error.message };

  // 배지 자동 수여 (백그라운드, 에러 무시)
  await awardBadgesIfEarned(supabase, user.id, totalSessions, totalReflections, streakWeeks, totalKeywords).catch(() => {});

  return { data };
}

export async function getHeatmapData(weeks = 52) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // weeks 주 전부터 오늘까지의 날짜 범위
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - weeks * 7);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("sessions")
    .select("session_date")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .gte("session_date", startStr)
    .lte("session_date", endStr);

  if (error) return { error: error.message };

  // 날짜별 카운트 집계
  const countMap: Record<string, number> = {};
  for (const s of (data ?? []) as any[]) {
    const d = s.session_date;
    if (d) countMap[d] = (countMap[d] ?? 0) + 1;
  }

  const heatmapData = Object.entries(countMap).map(([date, count]) => ({
    date,
    count,
  }));

  return { data: heatmapData };
}

export async function getAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function getEmotionStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("sessions")
    .select("emotion_type, emotion_intensity")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .not("emotion_type", "is", null);

  if (error) return { error: error.message };

  const rows = (data ?? []) as any[];
  const countMap: Record<string, number> = {};
  const intensityMap: Record<string, number[]> = {};

  for (const row of rows) {
    const et = row.emotion_type;
    if (et) {
      countMap[et] = (countMap[et] ?? 0) + 1;
      if (!intensityMap[et]) intensityMap[et] = [];
      if (row.emotion_intensity != null) {
        intensityMap[et].push(row.emotion_intensity);
      }
    }
  }

  const stats = Object.entries(countMap).map(([emotion, count]) => ({
    emotion,
    count,
    avgIntensity:
      intensityMap[emotion]?.length > 0
        ? Math.round(
            (intensityMap[emotion].reduce((a, b) => a + b, 0) /
              intensityMap[emotion].length) *
              10
          ) / 10
        : 0,
  })).sort((a, b) => b.count - a.count);

  return { data: stats };
}

const BADGE_DEFINITIONS = [
  { type: "first_session",   title: "첫 걸음",        description: "첫 번째 수업을 기록했어요",       check: (s: number) => s >= 1 },
  { type: "five_sessions",   title: "5회 달성",        description: "5회 수업을 기록했어요",            check: (s: number) => s >= 5 },
  { type: "ten_sessions",    title: "10회 달성",       description: "10회 수업을 기록했어요",           check: (s: number) => s >= 10 },
  { type: "twenty_sessions", title: "20회 달성",       description: "20회 수업을 기록했어요",           check: (s: number) => s >= 20 },
  { type: "fifty_sessions",  title: "50회 달성",       description: "50회 수업을 기록했어요",           check: (s: number) => s >= 50 },
  { type: "hundred_sessions",title: "100회 달성",      description: "100회 수업을 기록했어요",          check: (s: number) => s >= 100 },
  { type: "first_reflection",title: "회고하는 나",     description: "첫 번째 회고를 작성했어요",        check: (_s: number, r: number) => r >= 1 },
  { type: "five_reflections",title: "성찰의 달인",     description: "5회 이상 회고를 작성했어요",       check: (_s: number, r: number) => r >= 5 },
  { type: "ten_reflections", title: "회고 전문가",     description: "10회 이상 회고를 작성했어요",      check: (_s: number, r: number) => r >= 10 },
  { type: "streak_3",        title: "3주 연속",        description: "3주 연속으로 기록했어요",          check: (_s: number, _r: number, streak: number) => streak >= 3 },
  { type: "streak_5",        title: "5주 연속",        description: "5주 연속으로 기록했어요",          check: (_s: number, _r: number, streak: number) => streak >= 5 },
  { type: "streak_12",       title: "3개월 연속",      description: "12주 연속으로 기록했어요",         check: (_s: number, _r: number, streak: number) => streak >= 12 },
  { type: "streak_26",       title: "반년 연속",       description: "26주 연속으로 기록했어요",         check: (_s: number, _r: number, streak: number) => streak >= 26 },
  { type: "keyword_50",      title: "키워드 수집가",   description: "50개 이상의 키워드를 기록했어요",  check: (_s: number, _r: number, _st: number, kw: number) => kw >= 50 },
  { type: "keyword_100",     title: "키워드 마스터",   description: "100개 이상의 키워드를 기록했어요", check: (_s: number, _r: number, _st: number, kw: number) => kw >= 100 },
  { type: "keyword_200",     title: "키워드 전문가",   description: "200개 이상의 키워드를 기록했어요", check: (_s: number, _r: number, _st: number, kw: number) => kw >= 200 },
  { type: "streak_52",       title: "1년 연속",        description: "52주 연속으로 기록했어요",         check: (_s: number, _r: number, streak: number) => streak >= 52 },
  { type: "halfway",         title: "반환점 통과",     description: "총 30회 이상 수업을 기록했어요",   check: (s: number) => s >= 30 },
  { type: "all_emotions",    title: "감정 마스터",     description: "모든 감정 유형을 경험했어요",       check: (s: number) => s >= 40 }, // proxy: many sessions → diverse emotions
  { type: "graduation",      title: "졸업을 향하여",   description: "50회 이상 기록하고 회고도 10회 이상!", check: (s: number, r: number) => s >= 50 && r >= 10 },
] as const;

async function awardBadgesIfEarned(
  supabase: any,
  userId: string,
  totalSessions: number,
  totalReflections: number,
  streakWeeks: number,
  totalKeywords: number
) {
  // 이미 획득한 배지 조회
  const { data: existing } = await supabase
    .from("achievements")
    .select("badge_type")
    .eq("user_id", userId);

  const existingTypes = new Set((existing ?? []).map((a: any) => a.badge_type));

  const toInsert = BADGE_DEFINITIONS.filter(
    (b) =>
      !existingTypes.has(b.type) &&
      b.check(totalSessions, totalReflections, streakWeeks, totalKeywords)
  ).map((b) => ({
    user_id: userId,
    badge_type: b.type,
    title: b.title,
    description: b.description,
    earned_at: new Date().toISOString(),
    metadata: {},
  }));

  if (toInsert.length > 0) {
    await supabase.from("achievements").insert(toInsert);
  }
}
