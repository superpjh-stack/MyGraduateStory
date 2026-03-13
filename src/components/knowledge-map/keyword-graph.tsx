"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  word: string;
  count: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
}

const COLORS = [
  "#16a34a", "#2563eb", "#9333ea", "#dc2626",
  "#ea580c", "#0891b2", "#be185d", "#4f46e5",
  "#65a30d", "#d97706",
];

function useForceSimulation(nodes: Node[], edges: Edge[], width: number, height: number) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<{ nodes: (Node & { x: number; y: number; vx: number; vy: number })[] }>({ nodes: [] });

  useEffect(() => {
    if (nodes.length === 0 || width === 0) return;

    // 초기 위치: 원형 배치
    stateRef.current.nodes = nodes.map((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const r = Math.min(width, height) * 0.35;
      return {
        ...n,
        x: width / 2 + r * Math.cos(angle),
        y: height / 2 + r * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });

    const nodeMap = new Map(stateRef.current.nodes.map((n) => [n.word, n]));
    const maxCount = Math.max(...nodes.map((n) => n.count), 1);

    let tick = 0;
    const simulate = () => {
      const ns = stateRef.current.nodes;
      const alpha = Math.max(0.01, 0.3 * Math.exp(-tick * 0.015));
      tick++;

      for (const n of ns) {
        // 중심 인력
        n.vx += (width / 2 - n.x) * 0.003 * alpha;
        n.vy += (height / 2 - n.y) * 0.003 * alpha;

        // 노드 간 반발력
        for (const m of ns) {
          if (m === n) continue;
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const radius = 40 + (n.count / maxCount) * 20 + (m.count / maxCount) * 20;
          if (dist < radius) {
            const force = ((radius - dist) / dist) * 0.4 * alpha;
            n.vx += dx * force;
            n.vy += dy * force;
          }
        }
      }

      // 엣지 spring 힘
      for (const e of edges) {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 80 + 60 / (e.weight + 1);
        const force = ((dist - targetDist) / dist) * 0.06 * alpha;
        src.vx += dx * force;
        src.vy += dy * force;
        tgt.vx -= dx * force;
        tgt.vy -= dy * force;
      }

      // 속도 적용 + 감쇠
      for (const n of ns) {
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x = Math.max(40, Math.min(width - 40, n.x + n.vx));
        n.y = Math.max(40, Math.min(height - 40, n.y + n.vy));
      }

      setPositions(Object.fromEntries(ns.map((n) => [n.word, { x: n.x, y: n.y }])));

      if (tick < 200) {
        rafRef.current = requestAnimationFrame(simulate);
      }
    };

    rafRef.current = requestAnimationFrame(simulate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [nodes, edges, width, height]);

  return positions;
}

export function KeywordGraph({ nodes, edges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 400 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ w: rect.width, h: 400 });
    });
    obs.observe(containerRef.current);
    setSize({ w: containerRef.current.clientWidth, h: 400 });
    return () => obs.disconnect();
  }, []);

  const positions = useForceSimulation(nodes, edges, size.w, size.h);
  const maxCount = Math.max(...nodes.map((n) => n.count), 1);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        키워드를 5개 이상 기록하면 지식 지도가 나타나요
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg width={size.w} height={size.h} className="overflow-visible">
        {/* 엣지 */}
        {edges.map((e, i) => {
          const src = positions[e.source];
          const tgt = positions[e.target];
          if (!src || !tgt) return null;
          return (
            <line
              key={i}
              x1={src.x}
              y1={src.y}
              x2={tgt.x}
              y2={tgt.y}
              stroke="#d1d5db"
              strokeWidth={Math.min(e.weight * 0.8, 3)}
              strokeOpacity={0.5}
            />
          );
        })}

        {/* 노드 */}
        {nodes.map((n, i) => {
          const pos = positions[n.word];
          if (!pos) return null;
          const r = 12 + (n.count / maxCount) * 14;
          const color = COLORS[i % COLORS.length];
          return (
            <g key={n.word} transform={`translate(${pos.x},${pos.y})`}>
              <circle r={r} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={1.5} />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(9, Math.min(13, 9 + (n.count / maxCount) * 5))}
                fill={color}
                fontWeight={600}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {n.word.length > 8 ? n.word.slice(0, 7) + "…" : n.word}
              </text>
              <title>{n.word} ({n.count}회)</title>
            </g>
          );
        })}
      </svg>

      {/* 범례 */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        원이 클수록 자주 등장한 키워드 · 선으로 연결된 키워드는 같은 수업에서 함께 언급됨
      </p>
    </div>
  );
}
