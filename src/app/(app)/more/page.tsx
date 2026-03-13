import { getProfile } from "@/lib/actions/profile";
import { signOut } from "@/lib/actions/auth";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  Settings,
  Timer,
  BarChart3,
  BookOpen,
  LogOut,
  ChevronRight,
  Network,
  LineChart,
  BookMarked,
  Cpu,
  Download,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "학습",
    items: [
      { href: "/timeline",    icon: Clock,       label: "타임라인",    desc: "나의 1년 여정 한눈에" },
      { href: "/reflect",     icon: Sparkles,    label: "주간 회고",    desc: "배움을 되새기는 시간" },
      { href: "/subjects",    icon: BookOpen,    label: "과목 관리",    desc: "수강 과목 추가/수정" },
    ],
  },
  {
    title: "분석 & 인사이트",
    items: [
      { href: "/knowledge-map", icon: Network,   label: "지식 지도",    desc: "키워드 연결 관계 시각화" },
      { href: "/analytics",   icon: LineChart,   label: "성장 분석",    desc: "학습 데이터 종합 분석" },
      { href: "/storybook",   icon: BookMarked,  label: "졸업 스토리북", desc: "나의 석사 여정 한 권의 책" },
      { href: "/ai-summary",  icon: Cpu,         label: "AI 학습 요약",  desc: "기록 기반 자동 학습 리포트" },
    ],
  },
  {
    title: "성장 도구",
    items: [
      { href: "/capsule",     icon: Timer,       label: "타임캡슐",    desc: "미래의 나에게 편지 쓰기" },
      { href: "/assessment",  icon: BarChart3,   label: "자가진단",    desc: "Before & After 성장 비교" },
      { href: "/export",      icon: Download,    label: "데이터 내보내기", desc: "CSV로 전체 기록 다운로드" },
    ],
  },
  {
    title: "앱",
    items: [
      { href: "/settings",    icon: Settings,    label: "설정",        desc: "프로필 및 학기 설정" },
    ],
  },
];

export default async function MorePage() {
  const res = await getProfile();
  const profile = (res.data ?? {}) as any;

  return (
    <div className="space-y-6">
      {/* 프로필 */}
      <Link href="/settings" className="flex items-center gap-3 bg-card rounded-2xl border p-4 hover:bg-muted/50 transition">
        <div className="w-12 h-12 rounded-full bg-forest-100 flex items-center justify-center text-xl">
          🌱
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{profile.display_name ?? "Gerardo"}</p>
          <p className="text-xs text-muted-foreground truncate">{res.email}</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </Link>

      {/* 메뉴 그룹 */}
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {group.title}
          </h2>
          <div className="bg-card rounded-2xl border divide-y">
            {group.items.map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition first:rounded-t-2xl last:rounded-b-2xl"
              >
                <Icon size={18} className="text-forest-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* 로그아웃 */}
      <form action={signOut}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 text-sm text-destructive py-3 rounded-2xl border border-destructive/30 hover:bg-destructive/5 transition"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </form>
    </div>
  );
}
