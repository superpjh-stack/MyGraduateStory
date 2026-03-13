"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("order_index");

  if (error) return { error: error.message };
  return { data };
}

export async function createSubject(data: {
  name: string;
  professor?: string;
  color: string;
  description?: string;
  scheduleDay?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { count } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: subject, error } = await supabase
    .from("subjects")
    .insert({
      user_id: user.id,
      name: data.name,
      professor: data.professor ?? null,
      color: data.color,
      description: data.description ?? null,
      schedule_day: data.scheduleDay ?? null,
      order_index: (count ?? 0) + 1,
      is_active: true,
    } as any)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { data: subject };
}

export async function updateSubject(id: string, updates: {
  name?: string;
  professor?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("subjects")
    .update({
      ...(updates.name && { name: updates.name }),
      ...(updates.professor !== undefined && { professor: updates.professor }),
      ...(updates.color && { color: updates.color }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  return { data };
}

export async function archiveSubject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await (supabase as any)
    .from("subjects")
    .update({ archived_at: new Date().toISOString(), is_active: false })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/subjects");
  revalidatePath("/dashboard");
  return { data };
}
