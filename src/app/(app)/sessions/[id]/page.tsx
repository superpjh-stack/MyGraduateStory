import { getSessionById } from "@/lib/actions/sessions";
import { formatDate, EMOTION_LABELS, DAY_TYPE_LABELS } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getSessionById(params.id) as any;
  if (!result.data) notFound();

  const session = result.data;
  const emotion = session.emotion_type ? EMOTION_LABELS[session.emotion_type] : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/sessions" className="p-2 rounded-xl hover:bg-muted transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {session.subjects?.name}{" "}
            <span className="text-muted-foreground font-normal text-base">
              #{session.session_number}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(session.session_date)} · {DAY_TYPE_LABELS[session.day_type]}
          </p>
        </div>
        <Link
          href={`/sessions/${session.id}/edit`}
          className="p-2 rounded-xl hover:bg-muted transition text-muted-foreground hover:text-foreground"
          title="수정"
        >
          <Pencil size={18} />
        </Link>
      </div>

      {session.learned && (
        <div className="bg-card rounded-2xl border p-4 space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">📖 배운 것</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{session.learned}</p>
        </div>
      )}

      {session.felt && (
        <div className="bg-card rounded-2xl border p-4 space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">💭 느낀 것</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{session.felt}</p>
        </div>
      )}

      {emotion && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">감정:</span>
          <span className="text-sm font-medium">{emotion}</span>
          {session.emotion_intensity && (
            <span className="text-xs text-muted-foreground">({session.emotion_intensity}/10)</span>
          )}
        </div>
      )}

      {session.keywords.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">🏷️ 키워드</h2>
          <div className="flex flex-wrap gap-1.5">
            {session.keywords.map((kw: string) => (
              <span
                key={kw}
                className="bg-forest-50 text-forest-700 text-sm rounded-full px-3 py-1"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {session.session_attachments?.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">📎 첨부파일</h2>
          <div className="space-y-2">
            {session.session_attachments.map((att: any) => (
              <a
                key={att.id}
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-card rounded-xl border p-3 text-sm hover:bg-muted transition"
              >
                📄 {att.file_name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
