import { getSessions } from "@/lib/actions/sessions";
import { getReflections } from "@/lib/actions/reflections";
import { ExportButton } from "@/components/export/export-button";
import { PrintButton } from "@/components/export/print-button";

export default async function ExportPage() {
  const [sessionsRes, reflectionsRes] = await Promise.all([
    getSessions(1000),
    getReflections(200),
  ]);

  const sessions = (sessionsRes.data ?? []) as any[];
  const reflections = (reflectionsRes.data ?? []) as any[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">데이터 내보내기 💾</h1>
        <p className="text-sm text-muted-foreground mt-0.5">기록한 데이터를 다양한 형식으로 내보내기</p>
      </div>

      <div className="space-y-3">
        {/* 수업 기록 내보내기 */}
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">수업 기록</h2>
            <p className="text-xs text-muted-foreground mt-0.5">총 {sessions.length}개의 기록</p>
          </div>
          <p className="text-xs text-muted-foreground">
            날짜, 과목, 학습 내용, 키워드, 감정 등 모든 수업 기록을 포함합니다
          </p>
          <div className="flex gap-2 flex-wrap">
            <ExportButton type="sessions" data={sessions} filename="mygraduate_sessions" format="csv" />
            <ExportButton type="sessions" data={sessions} filename="mygraduate_sessions" format="json" />
          </div>
        </div>

        {/* 회고 내보내기 */}
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">주간 회고</h2>
            <p className="text-xs text-muted-foreground mt-0.5">총 {reflections.length}개의 회고</p>
          </div>
          <p className="text-xs text-muted-foreground">
            주차, 요약, 배움, 나에게 보내는 말 등 모든 회고 기록을 포함합니다
          </p>
          <div className="flex gap-2 flex-wrap">
            <ExportButton type="reflections" data={reflections} filename="mygraduate_reflections" format="csv" />
            <ExportButton type="reflections" data={reflections} filename="mygraduate_reflections" format="json" />
          </div>
        </div>

        {/* PDF 내보내기 */}
        <div className="bg-card rounded-2xl border p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-sm">PDF 저장</h2>
            <p className="text-xs text-muted-foreground mt-0.5">현재 페이지를 PDF로 인쇄</p>
          </div>
          <p className="text-xs text-muted-foreground">
            브라우저 인쇄 기능으로 PDF 파일을 저장할 수 있어요. 스토리북 페이지에서도 사용 가능합니다
          </p>
          <PrintButton />
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        CSV/JSON 파일은 Excel, Google Sheets 등에서 열 수 있어요
      </p>
    </div>
  );
}
