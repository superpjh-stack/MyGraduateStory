import { getSessions } from "@/lib/actions/sessions";
import { getReflections } from "@/lib/actions/reflections";
import { formatDate, EMOTION_LABELS } from "@/lib/utils";
import { BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { TimelineFilter } from "@/components/timeline/timeline-filter";
import { Suspense } from "react";

type TimelineEvent =
  | { type: "session"; date: string; data: any }
  | { type: "reflection"; date: string; data: any };

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const filter = searchParams.filter ?? "all";

  const [sessionsRes, reflectionsRes] = await Promise.all([
    getSessions(200),
    getReflections(52),
  ]);

  const sessions = (sessionsRes.data ?? []) as any[];
  const reflections = (reflectionsRes.data ?? []) as any[];

  // 날짜 기준 병합 정렬
  let events: TimelineEvent[] = [];
  if (filter !== "reflections") {
    events.push(...sessions.map((s) => ({ type: "session" as const, date: s.session_date, data: s })));
  }
  if (filter !== "sessions") {
    events.push(...reflections.map((r) => ({ type: "reflection" as const, date: r.created_at.split("T")[0], data: r })));
  }
  events = events.sort((a, b) => b.date.localeCompare(a.date));

  // 월별 그룹핑
  const grouped = events.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const month = event.date.substring(0, 7);
    acc[month] = acc[month] ?? [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">타임라인 🕐</h1>
        <p className="text-sm text-muted-foreground mt-0.5">나의 1년 여정</p>
      </div>

      <Suspense>
        <TimelineFilter current={filter} />
      </Suspense>

      {events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🌱</div>
          <p className="font-medium">아직 기록이 없어요</p>
          <p className="text-sm mt-1">첫 번째 수업을 기록하면 타임라인이 시작돼요</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground sticky top-14 bg-background py-1">
                {month.replace("-", "년 ")}월
              </h2>
              <div className="relative pl-4">
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-border rounded-full" />
                <div className="space-y-3">
                  {monthEvents.map((event, i) => (
                    <div key={i} className="relative">
                      <div
                        className={`absolute -left-[18px] top-3 w-3 h-3 rounded-full border-2 border-background ${
                          event.type === "session" ? "bg-forest-500" : "bg-warm-400"
                        }`}
                      />
                      {event.type === "session" ? (
                        <Link
                          href={`/sessions/${event.data.id}`}
                          className="block bg-card rounded-2xl border p-3 space-y-1.5 hover:shadow-sm transition ml-2"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-forest-500 flex-shrink-0" />
                            <span className="text-xs font-medium text-forest-700">
                              {event.data.subjects?.name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDate(event.data.session_date, "d일")}
                            </span>
                          </div>
                          {event.data.learned && (
                            <p className="text-sm line-clamp-2 pl-5">{event.data.learned}</p>
                          )}
                          {event.data.emotion_type && (
                            <span className="text-xs text-muted-foreground pl-5">
                              {EMOTION_LABELS[event.data.emotion_type]}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <div className="bg-warm-50 border border-warm-200 rounded-2xl p-3 space-y-1 ml-2">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-warm-500 flex-shrink-0" />
                            <span className="text-xs font-medium text-warm-700">
                              {event.data.year}년 {event.data.week_number}주차 회고
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {formatDate(event.data.created_at, "d일")}
                            </span>
                          </div>
                          {event.data.summary && (
                            <p className="text-sm line-clamp-2 pl-5 text-warm-800">
                              {event.data.summary}
                            </p>
                          )}
                          {event.data.self_message && (
                            <p className="text-xs font-serif italic text-warm-600 pl-5">
                              "{event.data.self_message}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
