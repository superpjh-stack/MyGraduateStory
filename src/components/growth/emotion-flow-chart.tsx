"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { EMOTION_LABELS } from "@/lib/utils";

interface EmotionStat {
  emotion: string;
  count: number;
  avgIntensity: number;
}

const EMOTION_COLORS: Record<string, string> = {
  excited:   "#f97316",
  focused:   "#16a34a",
  confused:  "#a855f7",
  tired:     "#94a3b8",
  inspired:  "#eab308",
  satisfied: "#3b82f6",
};

interface Props {
  data: EmotionStat[];
}

export function EmotionFlowChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        아직 감정 기록이 없어요
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: EMOTION_LABELS[d.emotion]?.replace(/^.+?\s/, "") ?? d.emotion,
    fullLabel: EMOTION_LABELS[d.emotion] ?? d.emotion,
    count: d.count,
    emotion: d.emotion,
  }));

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, _: string, props: any) => [
              `${value}회`,
              props.payload?.fullLabel ?? "",
            ]}
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {chartData.map((entry) => (
              <Cell
                key={entry.emotion}
                fill={EMOTION_COLORS[entry.emotion] ?? "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 범례 */}
      <div className="flex flex-wrap gap-2">
        {data.map((d) => (
          <div key={d.emotion} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: EMOTION_COLORS[d.emotion] ?? "#94a3b8" }}
            />
            {EMOTION_LABELS[d.emotion] ?? d.emotion}
            <span className="text-foreground font-medium">{d.count}회</span>
          </div>
        ))}
      </div>
    </div>
  );
}
