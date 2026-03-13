import { signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle() as any
    : null;

  const displayName = profile?.data?.display_name ?? user?.email?.split("@")[0] ?? "Gerardo";

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="font-bold text-forest-700">MyGraduate</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{displayName}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground"
              title="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
