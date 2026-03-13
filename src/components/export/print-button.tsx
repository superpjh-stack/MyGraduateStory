"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-forest-600 text-forest-700 rounded-xl hover:bg-forest-50 transition"
    >
      <Printer size={14} />
      PDF로 인쇄
    </button>
  );
}
