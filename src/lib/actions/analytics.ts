"use server";

import { createClient } from "@/lib/supabase/server";
import { EMOTION_LABELS } from "@/lib/utils";

export async function getAnalytics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const [sessionsRes, reflectionsRes, snapshotsRes] = await Promise.all([
    supabase.from("sessions")
      .select("session_date, keywords, emotion_type, emotion_intensity, subject_id, subjects(name, color)")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("session_date", { ascending: true }),
    supabase.from("reflections")
      .select("week_number, year, top_learnings, created_at")
      .eq("user_id", user.id)
      .is("archived_at", null),
    supabase.from("growth_snapshots")
      .select("*")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: true })
      .limit(52),
  ]);

  const sessions = (sessionsRes.data ?? []) as any[];
  const reflections = (reflectionsRes.data ?? []) as any[];
  const snapshots = (snapshotsRes.data ?? []) as any[];

  // 월별 세션 수
  const monthlySessionCount: Record<string, number> = {};
  for (const s of sessions) {
    const month = s.session_date?.substring(0, 7);
    if (month) monthlySessionCount[month] = (monthlySessionCount[month] ?? 0) + 1;
  }
  const monthlySessions = Object.entries(monthlySessionCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month: month.replace("-", "."), count }));

  // 감정 분포
  const emotionCount: Record<string, number> = {};
  for (const s of sessions) {
    if (s.emotion_type) emotionCount[s.emotion_type] = (emotionCount[s.emotion_type] ?? 0) + 1;
  }
  const emotionData = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => ({
      emotion,
      label: EMOTION_LABELS[emotion] ?? emotion,
      count,
      pct: Math.round((count / sessions.length) * 100),
    }));

  // 과목별 세션 수
  const subjectCount: Record<string, { name: string; color: string; count: number }> = {};
  for (const s of sessions) {
    const sid = s.subject_id;
    if (sid) {
      if (!subjectCount[sid]) {
        subjectCount[sid] = { name: s.subjects?.name ?? sid, color: s.subjects?.color ?? "#ccc", count: 0 };
      }
      subjectCount[sid].count++;
    }
  }
  const subjectData = Object.values(subjectCount).sort((a, b) => b.count - a.count);

  // 키워드 빈도 TOP 20
  const allKeywords = sessions.flatMap((s) => s.keywords ?? []);
  const kwFreq: Record<string, number> = {};
  for (const kw of allKeywords) kwFreq[kw] = (kwFreq[kw] ?? 0) + 1;
  const topKeywords = Object.entries(kwFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  // 주간 기록률 (최근 26주)
  const weeks: { week: string; recorded: boolean }[] = [];
  const now = new Date();
  const sessionDateSet = new Set(sessions.map((s) => s.session_date));
  for (let i = 25; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const fri = new Date(d);
    fri.setDate(d.getDate() - ((d.getDay() + 2) % 7)); // 금요일
    const sat = new Date(fri);
    sat.setDate(fri.getDate() + 1);
    const friStr = fri.toISOString().split("T")[0];
    const satStr = sat.toISOString().split("T")[0];
    const weekLabel = `W${String(25 - i + 1).padStart(2, "0")}`;
    weeks.push({
      week: weekLabel,
      recorded: sessionDateSet.has(friStr) || sessionDateSet.has(satStr),
    });
  }

  // 성장 지수 추이
  const growthTrend = snapshots.map((s) => ({
    date: s.snapshot_date,
    index: s.growth_index,
    level: s.tree_level,
  }));

  // 평균 감정 강도
  const intensities = sessions
    .filter((s) => s.emotion_intensity != null)
    .map((s) => s.emotion_intensity as number);
  const avgIntensity =
    intensities.length > 0
      ? Math.round((intensities.reduce((a, b) => a + b, 0) / intensities.length) * 10) / 10
      : 0;

  return {
    data: {
      totalSessions: sessions.length,
      totalReflections: reflections.length,
      totalKeywords: allKeywords.length,
      avgIntensity,
      monthlySessions,
      emotionData,
      subjectData,
      topKeywords,
      weeks,
      growthTrend,
    },
  };
}

export async function getKeywordConnections() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("sessions")
    .select("keywords")
    .eq("user_id", user.id)
    .is("archived_at", null);

  if (error) return { error: error.message };

  const sessions = (data ?? []) as any[];

  // 키워드 빈도
  const kwFreq: Record<string, number> = {};
  for (const s of sessions) {
    for (const kw of s.keywords ?? []) {
      kwFreq[kw] = (kwFreq[kw] ?? 0) + 1;
    }
  }

  // 상위 30개 키워드만 사용
  const topKws = Object.entries(kwFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));
  const topKwSet = new Set(topKws.map((k) => k.word));

  // 공출현 엣지 생성 (같은 세션에 함께 등장한 키워드 쌍)
  const edgeMap: Record<string, number> = {};
  for (const s of sessions) {
    const kws = (s.keywords ?? []).filter((k: string) => topKwSet.has(k));
    for (let i = 0; i < kws.length; i++) {
      for (let j = i + 1; j < kws.length; j++) {
        const key = [kws[i], kws[j]].sort().join("||");
        edgeMap[key] = (edgeMap[key] ?? 0) + 1;
      }
    }
  }

  const edges = Object.entries(edgeMap)
    .filter(([, w]) => w >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([key, weight]) => {
      const [source, target] = key.split("||");
      return { source, target, weight };
    });

  return { data: { nodes: topKws, edges } };
}
