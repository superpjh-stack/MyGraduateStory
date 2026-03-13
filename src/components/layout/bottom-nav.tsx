"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, TreePine, MoreHorizontal, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LEFT_ITEMS = [
  { href: "/dashboard", icon: Home, label: "홈" },
  { href: "/sessions", icon: BookOpen, label: "기록" },
];

const RIGHT_ITEMS = [
  { href: "/growth", icon: TreePine, label: "성장" },
  { href: "/more", icon: MoreHorizontal, label: "더보기" },
];

interface BottomNavProps {
  onCapture?: () => void;
}

export function BottomNav({ onCapture }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t safe-area-pb"
         style={{ background: "rgba(250,247,242,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
        {/* 왼쪽 2개 탭 */}
        {LEFT_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-2 min-h-[44px] justify-center transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        {/* 중앙 FAB 공간 */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={onCapture}
            className="w-14 h-14 -mt-5 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            style={{ boxShadow: "0 4px 12px rgba(45,90,61,0.4)" }}
            aria-label="빠른 메모"
          >
            <Zap size={24} />
          </button>
        </div>

        {/* 오른쪽 2개 탭 */}
        {RIGHT_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 py-2 min-h-[44px] justify-center transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
