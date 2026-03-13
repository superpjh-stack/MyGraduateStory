"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;   // "YYYY-MM-DD"
  count: number;  // 해당 날짜의 수업 기록 수
}

interface CalendarHeatmapProps {
  data: HeatmapDay[];
  weeks?: number; // 표시할 주 수 (기본 52주)
}

function getDatesBySunday(weeks: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 이번 주 토요일까지 표시
  const dayOfWeek = today.getDay(); // 0=일, 6=토
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - dayOfWeek));

  // weeks * 7일 전부터 시작
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - weeks * 7 + 1);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  return dates;
}

function toYMD(date: Date): string {
  return date.toISOString().split("T")[0];
}

// count -> forest 색상 클래스
function getColorClass(count: number): string {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-forest-100";
  if (count === 2) return "bg-forest-200";
  if (count === 3) return "bg-forest-400";
  return "bg-forest-600";
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export function CalendarHeatmap({ data, weeks = 52 }: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // date -> count 맵 생성
  const countMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of data) {
      map[d.date] = (map[d.date] ?? 0) + d.count;
    }
    return map;
  }, [data]);

  // 날짜 배열 (일~토 순서)
  const allDates = useMemo(() => getDatesBySunday(weeks), [weeks]);

  // 주(column) 단위로 그룹화 — 첫 번째 날짜의 요일로 패딩
  const columns = useMemo(() => {
    const cols: (Date | null)[][] = [];
    let col: (Date | null)[] = [];

    // 첫 번째 날짜 전 빈 칸 패딩
    const firstDay = allDates[0]?.getDay() ?? 0;
    for (let i = 0; i < firstDay; i++) col.push(null);

    for (const d of allDates) {
      col.push(d);
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    }
    if (col.length > 0) {
      while (col.length < 7) col.push(null);
      cols.push(col);
    }
    return cols;
  }, [allDates]);

  // 월 레이블 위치 계산 (열 인덱스 -> 월 이름)
  const monthLabels = useMemo(() => {
    const labels: { colIdx: number; label: string }[] = [];
    let lastMonth = -1;
    columns.forEach((col, colIdx) => {
      const firstReal = col.find((d) => d !== null);
      if (firstReal) {
        const m = firstReal.getMonth();
        if (m !== lastMonth) {
          labels.push({ colIdx, label: MONTH_LABELS[m] });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [columns]);

  const cellSize = 12;  // px
  const gap = 2;        // px
  const step = cellSize + gap;

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block">
        {/* 월 레이블 */}
        <div
          className="relative mb-1"
          style={{ height: 16, width: columns.length * step }}
        >
          {monthLabels.map(({ colIdx, label }) => (
            <span
              key={colIdx}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: colIdx * step }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* 요일 레이블 */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAY_LABELS.map((label, i) => (
              <div
                key={label}
                className="text-[10px] text-muted-foreground flex items-center justify-end"
                style={{ height: cellSize, width: 14 }}
              >
                {i % 2 === 1 ? label : ""}
              </div>
            ))}
          </div>

          {/* 히트맵 셀 */}
          <div className="flex gap-0.5">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-0.5">
                {col.map((date, rowIdx) => {
                  if (!date) {
                    return (
                      <div
                        key={rowIdx}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    );
                  }
                  const ymd = toYMD(date);
                  const count = countMap[ymd] ?? 0;
                  return (
                    <div
                      key={ymd}
                      className={cn(
                        "rounded-sm cursor-default transition-opacity hover:opacity-70",
                        getColorClass(count)
                      )}
                      style={{ width: cellSize, height: cellSize }}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({
                          date: ymd,
                          count,
                          x: rect.left + window.scrollX,
                          y: rect.top + window.scrollY,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-[10px] text-muted-foreground">적음</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("rounded-sm", getColorClass(level))}
              style={{ width: cellSize, height: cellSize }}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">많음</span>
        </div>
      </div>

      {/* 툴팁 */}
      {tooltip && (
        <div
          className="fixed z-50 bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 shadow-md border pointer-events-none"
          style={{
            left: tooltip.x + cellSize + 4,
            top: tooltip.y - 8,
            transform: "translateY(-50%)",
          }}
        >
          <span className="font-medium">{tooltip.date}</span>
          {" — "}
          <span>{tooltip.count > 0 ? `${tooltip.count}회 수업` : "기록 없음"}</span>
        </div>
      )}
    </div>
  );
}
