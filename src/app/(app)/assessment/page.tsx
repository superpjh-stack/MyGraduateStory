import { getAssessments, ASSESSMENT_QUESTIONS } from "@/lib/actions/assessment";
import { AssessmentForm } from "@/components/assessment/assessment-form";
import { AssessmentRadarChart } from "@/components/assessment/assessment-radar-chart";

export default async function AssessmentPage() {
  const res = await getAssessments();
  const assessments = (res.data ?? []) as any[];

  const initial = assessments.find((a) => a.assessment_type === "initial");
  const monthly = assessments.filter((a) => a.assessment_type === "monthly");
  const final = assessments.find((a) => a.assessment_type === "final");

  const latest = final ?? monthly[monthly.length - 1] ?? initial;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">자가진단 📊</h1>
        <p className="text-sm text-muted-foreground mt-0.5">나의 성장을 객관적으로 확인해요</p>
      </div>

      {/* Before & After 비교 */}
      {initial && latest && initial.id !== latest.id && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">Before & After</h2>
          <AssessmentRadarChart
            questions={ASSESSMENT_QUESTIONS}
            before={initial.responses}
            after={latest.responses}
          />
        </div>
      )}

      {/* 새 자가진단 */}
      {!initial ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            학기 시작 시점의 자가진단을 완료하면 졸업 때 성장을 비교할 수 있어요.
          </p>
          <AssessmentForm type="initial" questions={ASSESSMENT_QUESTIONS} />
        </div>
      ) : (
        <AssessmentForm type="monthly" questions={ASSESSMENT_QUESTIONS} />
      )}

      {/* 기록 */}
      {assessments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            진단 기록
          </h2>
          {assessments.map((a) => {
            const avg =
              Object.values(a.responses as Record<string, number>).reduce(
                (sum: number, v: number) => sum + v,
                0
              ) / ASSESSMENT_QUESTIONS.length;
            return (
              <div key={a.id} className="bg-card rounded-2xl border p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium">
                    {a.assessment_type === "initial"
                      ? "🌱 입학 진단"
                      : a.assessment_type === "final"
                      ? "🎓 졸업 진단"
                      : "📅 월간 진단"}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(a.taken_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">{avg.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground"> / 5.0</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
