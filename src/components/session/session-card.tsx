import Link from "next/link";
import { formatDate, EMOTION_LABELS, DAY_TYPE_LABELS } from "@/lib/utils";
import { Session } from "@/types/database";
import { cn } from "@/lib/utils";

type SessionWithSubject = Session & {
  subjects: { name: string; color: string } | null;
};

export function SessionCard({ session }: { session: SessionWithSubject }) {
  const emotion = session.emotion_type ? EMOTION_LABELS[session.emotion_type] : null;

  return (
    <Link
      href={`/sessions/${session.id}`}
      className={cn(
        "block bg-card rounded-2xl border p-4 space-y-3 card-hover",
        session.is_quick_capture && "border-dashed"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: session.subjects?.color ?? "#2D5A3D" }}
          />
          <span className="text-sm font-medium truncate">
            {session.subjects?.name ?? "알 수 없는 과목"}
          </span>
          <span className="text-xs text-muted-foreground">
            #{session.session_number}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            {formatDate(session.session_date, "M/d")}
          </div>
          {session.day_type && (
            <div className="text-xs text-muted-foreground">
              {DAY_TYPE_LABELS[session.day_type]}
            </div>
          )}
        </div>
      </div>

      {session.learned && (
        <p className="text-sm text-foreground/80 line-clamp-2">{session.learned}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {session.keywords.slice(0, 4).map((kw) => (
            <span
              key={kw}
              className="text-xs bg-forest-50 text-forest-700 rounded-full px-2 py-0.5"
            >
              {kw}
            </span>
          ))}
          {session.keywords.length > 4 && (
            <span className="text-xs text-muted-foreground">+{session.keywords.length - 4}</span>
          )}
        </div>
        {emotion && (
          <span className="emotion-chip bg-warm-50 text-warm-700">{emotion}</span>
        )}
      </div>

      {session.is_quick_capture && (
        <div className="text-xs text-muted-foreground italic">⚡ 빠른 메모</div>
      )}
    </Link>
  );
}
