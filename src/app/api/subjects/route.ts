import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const { data } = await supabase
    .from("subjects")
    .select("id, name, color")
    .eq("user_id", user.id)
    .is("archived_at", null)
    .order("order_index");

  return NextResponse.json(data ?? []);
}
