import { BookOpen, Tag, Sparkles, Flame } from "lucide-react";

interface WeeklyStatsProps {
  totalSessions: number;
  totalKeywords: number;
  totalReflections: number;
  streakWeeks: number;
  semesterWeek?: number;
}

export function WeeklyStats({
  totalSessions,
  totalKeywords,
  totalReflections,
  streakWeeks,
  semesterWeek = 1,
}: WeeklyStatsProps) {
  const stats = [
    {
      icon: BookOpen,
      label: "총 수업",
      value: totalSessions,
      unit: "회",
      color: "text-forest-600",
      bg: "bg-forest-50",
    },
    {
      icon: Tag,
      label: "키워드",
      value: totalKeywords,
      unit: "개",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      icon: Sparkles,
      label: "회고",
      value: totalReflections,
      unit: "회",
      color: "text-warm-600",
      bg: "bg-warm-50",
    },
    {
      icon: Flame,
      label: "연속",
      value: streakWeeks,
      unit: "주",
      color: "text-earth-600",
      bg: "bg-earth-50",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          나의 여정
        </h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {semesterWeek}주차
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ icon: Icon, label, value, unit, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-xl font-bold">
                {value}
                <span className="text-sm font-normal text-muted-foreground ml-0.5">{unit}</span>
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
