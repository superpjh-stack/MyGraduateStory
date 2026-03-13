"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStorybookData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const [profileRes, sessionsRes, reflectionsRes, snapshotsRes, achievementsRes, assessmentsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("sessions")
        .select("*, subjects(name, color)")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("session_date", { ascending: true }),
      supabase.from("reflections")
        .select("*")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("year", { ascending: true })
        .order("week_number", { ascending: true }),
      supabase.from("growth_snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("snapshot_date", { ascending: true }),
      supabase.from("achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: true }),
      supabase.from("self_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: true }),
    ]);

  const sessions = (sessionsRes.data ?? []) as any[];
  const reflections = (reflectionsRes.data ?? []) as any[];
  const snapshots = (snapshotsRes.data ?? []) as any[];
  const achievements = (achievementsRes.data ?? []) as any[];
  const assessments = (assessmentsRes.data ?? []) as any[];
  const profile = profileRes.data as any;

  // 월별 챕터 생성
  const monthMap: Record<string, { sessions: any[]; reflections: any[] }> = {};
  for (const s of sessions) {
    const month = s.session_date?.substring(0, 7);
    if (month) {
      if (!monthMap[month]) monthMap[month] = { sessions: [], reflections: [] };
      monthMap[month].sessions.push(s);
    }
  }
  for (const r of reflections) {
    const month = `${r.year}-${String(Math.ceil(r.week_number / 4.33)).padStart(2, "0")}`;
    if (!monthMap[month]) monthMap[month] = { sessions: [], reflections: [] };
    monthMap[month].reflections.push(r);
  }

  const chapters = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data], idx) => {
      const allKeywords = data.sessions.flatMap((s) => s.keywords ?? []);
      const keywordFreq: Record<string, number> = {};
      for (const kw of allKeywords) {
        keywordFreq[kw] = (keywordFreq[kw] ?? 0) + 1;
      }
      const topKeywords = Object.entries(keywordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([w]) => w);

      const emotionCounts: Record<string, number> = {};
      for (const s of data.sessions) {
        if (s.emotion_type) emotionCounts[s.emotion_type] = (emotionCounts[s.emotion_type] ?? 0) + 1;
      }
      const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      const highlights = [
        ...data.sessions.filter((s) => s.learned).slice(0, 2).map((s) => s.learned as string),
        ...data.reflections.filter((r) => r.summary).slice(0, 1).map((r) => r.summary as string),
      ].slice(0, 3);

      const selfMessages = data.reflections.filter((r) => r.self_message).map((r) => r.self_message as string);

      return {
        chapterNum: idx + 1,
        month,
        title: getChapterTitle(idx),
        sessionCount: data.sessions.length,
        reflectionCount: data.reflections.length,
        topKeywords,
        topEmotion,
        highlights,
        selfMessages,
        subjects: Array.from(new Set(data.sessions.map((s: any) => s.subjects?.name).filter(Boolean))),
      };
    });

  // 전체 통계
  const allKeywords = sessions.flatMap((s) => s.keywords ?? []);
  const keywordFreq: Record<string, number> = {};
  for (const kw of allKeywords) keywordFreq[kw] = (keywordFreq[kw] ?? 0) + 1;
  const topKeywords = Object.entries(keywordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w, c]) => ({ word: w, count: c }));

  const latestSnapshot = snapshots[snapshots.length - 1];
  const firstSnapshot = snapshots[0];

  return {
    data: {
      profile,
      chapters,
      totalSessions: sessions.length,
      totalReflections: reflections.length,
      totalKeywords: allKeywords.length,
      topKeywords,
      achievements,
      assessments,
      firstGrowthIndex: firstSnapshot?.growth_index ?? 0,
      latestGrowthIndex: latestSnapshot?.growth_index ?? 0,
      latestTreeLevel: latestSnapshot?.tree_level ?? 1,
      semesterStart: profile?.semester_start_date ?? null,
    },
  };
}

function getChapterTitle(idx: number): string {
  const titles = [
    "출발점 — 새로운 세계에 발을 내딛다",
    "기초를 다지다 — 낯설지만 설레는 시간",
    "깊어지다 — 개념이 연결되기 시작하다",
    "확장하다 — 시야가 넓어지는 경험",
    "도약하다 — 전문성이 형태를 갖추다",
    "완성하다 — 석사의 면모를 갖추다",
    "빛나다 — 모든 것이 하나로",
    "에필로그",
  ];
  return titles[idx] ?? `Chapter ${idx + 1}`;
}
