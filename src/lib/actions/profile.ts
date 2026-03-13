"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { error: error.message };
  return { data, email: user.email };
}

export async function updateProfile(updates: {
  displayName?: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  bio?: string;
  onboardingCompleted?: boolean;
  settings?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const payload: Record<string, unknown> = {};
  if (updates.displayName !== undefined) payload.display_name = updates.displayName;
  if (updates.semesterStartDate !== undefined) payload.semester_start_date = updates.semesterStartDate;
  if (updates.semesterEndDate !== undefined) payload.semester_end_date = updates.semesterEndDate;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.onboardingCompleted !== undefined) payload.onboarding_completed = updates.onboardingCompleted;
  if (updates.settings !== undefined) payload.settings = updates.settings;

  const { data, error } = await (supabase as any)
    .from("profiles")
    .update(payload)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { data };
}
