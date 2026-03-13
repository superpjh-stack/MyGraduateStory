"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

export function SessionFilter({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSubject = searchParams.get("subject") ?? "";

  const updateFilter = useCallback(
    (subjectId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (subjectId) params.set("subject", subjectId);
      else params.delete("subject");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  if (subjects.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => updateFilter("")}
        className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
          !currentSubject
            ? "bg-forest-600 text-white border-forest-600"
            : "bg-background text-muted-foreground border-border hover:bg-muted"
        }`}
      >
        전체
      </button>
      {subjects.map((s) => (
        <button
          key={s.id}
          onClick={() => updateFilter(s.id)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            currentSubject === s.id
              ? "text-white border-transparent"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          }`}
          style={
            currentSubject === s.id ? { background: s.color, borderColor: s.color } : {}
          }
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
