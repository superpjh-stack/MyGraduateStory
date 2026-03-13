"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCapsules() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("time_capsules")
    .select("*")
    .eq("user_id", user.id)
    .order("written_at", { ascending: false });

  if (error) return { error: error.message };
  return { data };
}

export async function createCapsule(params: {
  message: string;
  openAt: string; // ISO date string
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("time_capsules")
    .insert({
      user_id: user.id,
      message: params.message,
      written_at: new Date().toISOString(),
      open_at: params.openAt,
      is_opened: false,
      opened_at: null,
    } as any)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/capsule");
  return { data };
}

export async function openCapsule(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await (supabase as any)
    .from("time_capsules")
    .update({ is_opened: true, opened_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/capsule");
  return { data };
}
