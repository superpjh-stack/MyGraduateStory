"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Question {
  id: string;
  label: string;
}

interface Props {
  questions: Question[];
  before: Record<string, number>;
  after: Record<string, number>;
}

export function AssessmentRadarChart({ questions, before, after }: Props) {
  const data = questions.map((q) => ({
    subject: q.label.length > 8 ? q.label.slice(0, 8) + "…" : q.label,
    입학: before[q.id] ?? 0,
    현재: after[q.id] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: "#6b7280" }}
        />
        <Radar name="입학" dataKey="입학" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
        <Radar name="현재" dataKey="현재" stroke="#16a34a" fill="#16a34a" fillOpacity={0.4} />
        <Tooltip
          contentStyle={{ borderRadius: "0.75rem", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
