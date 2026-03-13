import { getSessions } from "@/lib/actions/sessions";
import { getSubjects } from "@/lib/actions/subjects";
import { SessionCard } from "@/components/session/session-card";
import { SessionFilter } from "@/components/session/session-filter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { subject?: string };
}) {
  const subjectId = searchParams.subject;

  const [sessionsRes, subjectsRes] = await Promise.all([
    getSessions(50, subjectId ? { subjectId } : undefined),
    getSubjects(),
  ]);

  const sessions = (sessionsRes.data ?? []) as any[];
  const subjects = (subjectsRes.data ?? []) as any[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">수업 기록</h1>
        <Link
          href="/sessions/new"
          className="flex items-center gap-1 bg-primary text-white text-sm px-3 py-2 rounded-xl hover:bg-forest-600 transition"
        >
          <Plus size={16} />
          새 기록
        </Link>
      </div>

      <Suspense>
        <SessionFilter subjects={subjects} />
      </Suspense>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">📚</div>
          <p className="font-medium">
            {subjectId ? "이 과목의 기록이 없어요" : "아직 수업 기록이 없어요"}
          </p>
          <p className="text-sm mt-1">첫 번째 수업을 기록해봐요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
