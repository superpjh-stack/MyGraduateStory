"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

interface Props {
  profile: {
    display_name: string | null;
    semester_start_date: string | null;
    semester_end_date: string | null;
    bio: string | null;
  };
  email: string | undefined;
}

export function SettingsForm({ profile, email }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [semesterStart, setSemesterStart] = useState(profile.semester_start_date ?? "");
  const [semesterEnd, setSemesterEnd] = useState(profile.semester_end_date ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateProfile({
        displayName,
        semesterStartDate: semesterStart || undefined,
        semesterEndDate: semesterEnd || undefined,
        bio: bio || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <h2 className="font-semibold text-sm">프로필</h2>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">이메일</label>
          <p className="text-sm text-foreground/70">{email}</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="displayName">이름</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground" htmlFor="bio">한 줄 소개</label>
          <input
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="AI 대학원생"
            className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-4 space-y-4">
        <h2 className="font-semibold text-sm">학기 설정</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="semesterStart">시작일</label>
            <input
              id="semesterStart"
              type="date"
              value={semesterStart}
              onChange={(e) => setSemesterStart(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="semesterEnd">종료일</label>
            <input
              id="semesterEnd"
              type="date"
              value={semesterEnd}
              onChange={(e) => setSemesterEnd(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          학기 시작일을 설정하면 대시보드에서 몇 주차인지 정확히 알 수 있어요.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-forest-600 transition disabled:opacity-50"
      >
        {isPending ? "저장 중..." : saved ? "✓ 저장됨" : "저장"}
      </button>
    </form>
  );
}
