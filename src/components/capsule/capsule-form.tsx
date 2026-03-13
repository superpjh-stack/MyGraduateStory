"use client";

import { useState, useTransition } from "react";
import { createCapsule } from "@/lib/actions/capsule";
import { useRouter } from "next/navigation";

export function CapsuleForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openAt, setOpenAt] = useState("");

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !openAt) return;
    startTransition(async () => {
      const res = await createCapsule({ message: message.trim(), openAt });
      if (!res.error) {
        setMessage("");
        setOpenAt("");
        setOpen(false);
        router.refresh();
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-forest-200 text-forest-700 py-5 rounded-2xl text-sm font-medium hover:bg-forest-50 transition flex flex-col items-center gap-2"
      >
        <span className="text-3xl">✉️</span>
        <span>미래의 나에게 편지 쓰기</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-4 space-y-4">
      <h2 className="font-semibold text-sm">새 타임캡슐</h2>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">미래의 나에게</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="졸업 후의 나에게... 지금 이 순간의 마음을 전해요."
          rows={5}
          className="w-full border rounded-xl px-3 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground">열어볼 날짜</label>
        <input
          type="date"
          value={openAt}
          min={minDateStr}
          onChange={(e) => setOpenAt(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 border border-border py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending || !message.trim() || !openAt}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-forest-600 transition disabled:opacity-50"
        >
          {isPending ? "봉인 중..." : "봉인하기 🔒"}
        </button>
      </div>
    </form>
  );
}
