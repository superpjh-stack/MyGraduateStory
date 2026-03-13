"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, BookOpen, TreePine, Clock, Sparkles,
  Timer, BarChart3, Settings, Network, BookMarked, LineChart, Download, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",    icon: Home,        label: "홈" },
  { href: "/sessions",     icon: BookOpen,    label: "기록" },
  { href: "/growth",       icon: TreePine,    label: "성장" },
  { href: "/timeline",     icon: Clock,       label: "타임라인" },
  { href: "/reflect",      icon: Sparkles,    label: "회고" },
  null, // divider
  { href: "/knowledge-map",icon: Network,     label: "지식 지도" },
  { href: "/analytics",    icon: LineChart,   label: "성장 분석" },
  { href: "/storybook",    icon: BookMarked,  label: "스토리북" },
  { href: "/ai-summary",   icon: Cpu,         label: "AI 요약" },
  null, // divider
  { href: "/capsule",      icon: Timer,       label: "타임캡슐" },
  { href: "/assessment",   icon: BarChart3,   label: "자가진단" },
  { href: "/export",       icon: Download,    label: "내보내기" },
  null, // divider
  { href: "/settings",     icon: Settings,    label: "설정" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-card border-r">
      {/* 로고 */}
      <div className="flex items-center gap-2 h-14 px-5 border-b">
        <span className="text-xl">🌱</span>
        <span className="font-bold text-forest-700">MyGraduate</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, idx) => {
          if (!item) {
            return <div key={idx} className="h-px bg-border my-2" />;
          }
          const { href, icon: Icon, label } = item;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-forest-100 text-forest-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={isActive ? "text-forest-600" : ""}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 버전 표시 */}
      <div className="px-5 py-3 border-t">
        <p className="text-[10px] text-muted-foreground">MyGraduate v0.3.0</p>
      </div>
    </aside>
  );
}
