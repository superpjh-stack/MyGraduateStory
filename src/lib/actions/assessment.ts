"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { AssessmentType } from "@/types/database";


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
