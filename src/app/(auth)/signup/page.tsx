"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold">여정을 시작해요 🌱</h2>
        <p className="text-sm text-muted-foreground">1년 후, 이 순간을 기억하게 될 거예요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="displayName">이름</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            placeholder="Gerardo"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="email">이메일</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="gerardo@example.com"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="password">비밀번호</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="6자 이상"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-forest-600 transition disabled:opacity-50"
        >
          {loading ? "가입 중..." : "여정 시작하기"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
