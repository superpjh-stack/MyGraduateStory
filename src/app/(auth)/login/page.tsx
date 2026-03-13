"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const QUICK_EMAIL = "gerardo@mygraduate.com";
const QUICK_PASSWORD = "admin1234";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);

  async function doLogin(loginEmail: string, loginPassword: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) return error.message;
    window.location.href = "/dashboard";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await doLogin(email, password);
    if (err) { setError(err); setLoading(false); }
  }

  async function handleQuickLogin() {
    setQuickLoading(true);
    setError(null);
    const supabase = createClient();

    // 1) 로그인 시도
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: QUICK_EMAIL,
      password: QUICK_PASSWORD,
    });

    if (!signInErr) {
      window.location.href = "/dashboard";
      return;
    }

    // 2) 계정 없으면 회원가입 — signUp 응답의 session을 바로 사용
    if (signInErr.message.includes("Invalid login credentials")) {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: QUICK_EMAIL,
        password: QUICK_PASSWORD,
        options: { data: { display_name: "Gerardo" } },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        setQuickLoading(false);
        return;
      }

      // auto-confirm이면 signUp 응답에 session이 포함됨 → 바로 이동
      if (data.session) {
        window.location.href = "/dashboard";
        return;
      }

      // session이 없으면 email confirm 필요
      setError("Supabase 대시보드 → Authentication → Providers → Email → 'Confirm email' 비활성화 후 다시 시도해주세요.");
      setQuickLoading(false);
      return;
    }

    setError(signInErr.message);
    setQuickLoading(false);
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">로그인</h2>
        <p className="text-sm text-muted-foreground">오늘의 배움을 기록해요</p>
      </div>

      {/* 빠른 로그인 */}
      <button
        type="button"
        onClick={handleQuickLogin}
        disabled={quickLoading || loading}
        className="w-full flex items-center justify-center gap-2 bg-forest-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-forest-600 transition disabled:opacity-50 shadow-sm"
      >
        {quickLoading ? "로그인 중..." : <><span>🌱</span> Gerardo로 빠른 로그인</>}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">또는</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="gerardo@example.com"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || quickLoading}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-forest-600 transition disabled:opacity-50"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
