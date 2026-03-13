"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getWeekNumber, getCurrentYear } from "@/lib/utils";

export async function createOrUpdateReflection(data: {
  weekNumber?: number;
  year?: number;
  summary: string;
  topLearnings: string[];
  emotionSummary?: string;
  nextWeekGoal?: string;
  selfMessage?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const weekNumber = data.weekNumber ?? getWeekNumber();
  const year = data.year ?? getCurrentYear();

  // upsert: 같은 주차 회고가 있으면 업데이트
  const { data: reflection, error } = await supabase
    .from("reflections")
    .upsert({
      user_id: user.id,
      week_number: weekNumber,
      year,
      summary: data.summary,
      top_learnings: data.topLearnings,
      emotion_summary: data.emotionSummary ?? null,
      next_week_goal: data.nextWeekGoal ?? null,
      self_message: data.selfMessage ?? null,
      highlight_session_ids: [],
    } as any, {
      onConflict: "user_id,week_number,year",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/reflect");
  return { data: reflection };
}

export async function getReflections(limit = 12) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("year", { ascending: false })
    .order("week_number", { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { data };
}

export async function getMonthlyStats(year: number, month: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // last day of month

  const [sessionsRes, reflectionsRes] = await Promise.all([
    supabase
      .from("sessions")
      .select("session_date, keywords, emotion_type, subjects(name)")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .gte("session_date", startDate)
      .lte("session_date", endDate),
    supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .eq("year", year)
      .gte("week_number", 1)
      .lte("week_number", 53),
  ]);

  const sessions = (sessionsRes.data ?? []) as any[];
  const reflections = (reflectionsRes.data ?? []) as any[];

  const allKeywords = sessions.flatMap((s: any) => s.keywords ?? []);
  const keywordFreq = allKeywords.reduce<Record<string, number>>((acc, kw: string) => {
    acc[kw] = (acc[kw] ?? 0) + 1;
    return acc;
  }, {});
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  const emotionCount = sessions.reduce<Record<string, number>>((acc, s: any) => {
    if (s.emotion_type) acc[s.emotion_type] = (acc[s.emotion_type] ?? 0) + 1;
    return acc;
  }, {});
  const topEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    data: {
      totalSessions: sessions.length,
      totalReflections: reflections.length,
      topKeywords,
      topEmotion,
      month: `${year}년 ${month}월`,
    },
  };
}

export async function getCurrentWeekReflection() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const weekNumber = getWeekNumber();
  const year = getCurrentYear();

  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id)
    .eq("week_number", weekNumber)
    .eq("year", year)
    .maybeSingle();

  if (error) return { error: error.message };
  return { data };
}
