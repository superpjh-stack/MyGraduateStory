"use client";

import { Download } from "lucide-react";

interface Props {
  type: "sessions" | "reflections";
  data: any[];
  filename: string;
  format?: "csv" | "json";
}

function sessionsToCsv(sessions: any[]): string {
  const headers = ["날짜", "과목", "학습 내용", "배운 점", "질문", "키워드", "감정", "감정 강도"];
  const rows = sessions.map((s) => [
    s.session_date ?? "",
    s.subjects?.name ?? "",
    s.content ?? "",
    s.learned ?? "",
    s.questions ?? "",
    (s.keywords ?? []).join("; "),
    s.emotion_type ?? "",
    s.emotion_intensity ?? "",
  ]);
  return [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
}

function reflectionsToCsv(reflections: any[]): string {
  const headers = ["연도", "주차", "요약", "주요 배움", "나에게 보내는 말", "작성일"];
  const rows = reflections.map((r) => [
    r.year ?? "",
    r.week_number ?? "",
    r.summary ?? "",
    (r.top_learnings ?? []).join("; "),
    r.self_message ?? "",
    r.created_at ? r.created_at.split("T")[0] : "",
  ]);
  return [headers, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
}

export function ExportButton({ type, data, filename, format = "csv" }: Props) {
  const handleDownload = () => {
    let blob: Blob;
    let ext: string;

    if (format === "json") {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      ext = "json";
    } else {
      const csv = type === "sessions" ? sessionsToCsv(data) : reflectionsToCsv(data);
      const bom = "\uFEFF"; // UTF-8 BOM for Excel Korean support
      blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      ext = "csv";
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={data.length === 0}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={14} />
      {format === "json" ? "JSON 다운로드" : "CSV 다운로드"}
    </button>
  );
}
