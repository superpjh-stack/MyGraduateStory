"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AssessmentType } from "@/types/database";

export const ASSESSMENT_QUESTIONS = [
  { id: "ai_basics",     label: "AI/ML 기초 이론 이해도",        scale: 5 },
  { id: "math",          label: "수학적 기반 (선형대수, 통계)",    scale: 5 },
  { id: "coding",        label: "파이썬/코딩 능력",               scale: 5 },
  { id: "research",      label: "논문 읽기 및 이해 능력",          scale: 5 },
  { id: "project",       label: "프로젝트 실행력",                scale: 5 },
  { id: "communication", label: "학문적 소통 능력",               scale: 5 },
  { id: "motivation",    label: "학습 동기 및 열정",               scale: 5 },
];

export async function getAssessments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("self_assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function createAssessment(params: {
  assessmentType: AssessmentType;
  responses: Record<string, number>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("self_assessments")
    .insert({
      user_id: user.id,
      assessment_type: params.assessmentType,
      responses: params.responses,
      taken_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/assessment");
  return { data };
}
