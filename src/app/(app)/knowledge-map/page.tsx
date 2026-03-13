import { getKeywordConnections } from "@/lib/actions/analytics";
import { KeywordGraph } from "@/components/knowledge-map/keyword-graph";

export default async function KnowledgeMapPage() {
  const res = await getKeywordConnections();
  const graph = (res.data ?? { nodes: [], edges: [] }) as any;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">지식 지도 🕸️</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          수업에서 기록한 키워드들의 연결 관계
        </p>
      </div>

      <div className="bg-card rounded-2xl border p-4">
        <KeywordGraph nodes={graph.nodes} edges={graph.edges} />
      </div>

      {graph.nodes.length > 0 && (
        <div className="bg-card rounded-2xl border p-4 space-y-3">
          <h2 className="font-semibold text-sm">TOP 키워드</h2>
          <div className="flex flex-wrap gap-2">
            {graph.nodes.slice(0, 15).map((n: any, i: number) => (
              <span
                key={n.word}
                className="text-xs px-2.5 py-1 rounded-full border"
                style={{
                  fontSize: Math.max(10, Math.min(14, 10 + (n.count / graph.nodes[0].count) * 5)),
                }}
              >
                {n.word}
                <span className="ml-1 text-muted-foreground">{n.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
