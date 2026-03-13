"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Database, DayType, EmotionType, SessionStatus } from "@/types/database";

type SessionInsert = Database["public"]["Tables"]["sessions"]["Insert"];

export async function createSession(data: {
  subjectId: string;
  sessionDate: string;
  dayType: DayType;
  learned?: string;
  felt?: string;
  emotionType?: EmotionType;
  emotionIntensity?: number;
  keywords?: string[];
  isQuickCapture?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 해당 과목의 다음 session_number 계산
  const { count } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("subject_id", data.subjectId)
    .eq("user_id", user.id);

  const payload: SessionInsert = {
    user_id: user.id,
    subject_id: data.subjectId,
    session_number: (count ?? 0) + 1,
    session_date: data.sessionDate,
    day_type: data.dayType,
    learned: data.learned ?? null,
    felt: data.felt ?? null,
    emotion_type: data.emotionType ?? null,
    emotion_intensity: data.emotionIntensity ?? null,
    keywords: data.keywords ?? [],
    photo_urls: [],
    is_quick_capture: data.isQuickCapture ?? false,
    status: "completed" as SessionStatus,
    archived_at: null,
  };

  const { data: session, error } = await supabase
    .from("sessions")
    .insert(payload as any)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  return { data: session };
}

export async function getSessions(
  limit = 20,
  filters?: { subjectId?: string; dateFrom?: string; dateTo?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  let query = supabase
    .from("sessions")
    .select("*, subjects(name, color)")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("session_date", { ascending: false })
    .limit(limit);

  if (filters?.subjectId) query = query.eq("subject_id", filters.subjectId);
  if (filters?.dateFrom) query = query.gte("session_date", filters.dateFrom);
  if (filters?.dateTo) query = query.lte("session_date", filters.dateTo);

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data };
}

export async function getSessionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*, subjects(name, color, professor), session_attachments(*)")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateSession(id: string, updates: Partial<SessionInsert>) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${id}`);
  return { data };
}

export async function archiveSession(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await (supabase as any)
    .from("sessions")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  return { data };
}

export async function getSessionStats(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("session_date, keywords, emotion_type, emotion_intensity, subject_id")
    .eq("user_id", userId)
    .is("archived_at", null);

  if (error) return { error: error.message };

  const rows = (data ?? []) as any[];
  const totalSessions = rows.length;
  const totalKeywords = rows.reduce((acc: number, s: any) => acc + (s.keywords?.length ?? 0), 0);
  const allKeywords = rows.flatMap((s: any) => s.keywords ?? []);
  const keywordFreq = allKeywords.reduce<Record<string, number>>((acc, kw) => {
    acc[kw] = (acc[kw] ?? 0) + 1;
    return acc;
  }, {});
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return { data: { totalSessions, totalKeywords, topKeywords } };
}
