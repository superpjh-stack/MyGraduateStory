"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const FILTERS = [
  { value: "all",         label: "전체" },
  { value: "sessions",    label: "📚 수업" },
  { value: "reflections", label: "✨ 회고" },
];

export function TimelineFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("filter");
    else params.set("filter", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => update(value)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            current === value
              ? "bg-forest-600 text-white border-forest-600"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
