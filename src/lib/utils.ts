import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, getWeek, getYear, differenceInWeeks } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = "PPP") {
  return format(new Date(date), fmt, { locale: ko });
}

export function getWeekNumber(date: Date = new Date()) {
  return getWeek(date, { weekStartsOn: 1 });
}

export function getCurrentYear() {
  return getYear(new Date());
}

/** 학기 시작일 기준 몇 번째 주인지 */
export function getSemesterWeek(semesterStart: string): number {
  const start = new Date(semesterStart);
  const now = new Date();
  return Math.max(1, differenceInWeeks(now, start) + 1);
}

/** 성장 지수(0~1000) 계산 */
export function calcGrowthIndex({
  totalSessions,
  totalKeywords,
  totalReflections,
  streakWeeks,
  selfAssessmentScore,
}: {
  totalSessions: number;
  totalKeywords: number;
  totalReflections: number;
  streakWeeks: number;
  selfAssessmentScore: number;
}) {
  const sessionScore = Math.min(totalSessions * 3, 300);
  const keywordScore = Math.min(totalKeywords * 1.5, 200);
  const reflectionScore = Math.min(totalReflections * 5, 200);
  const streakScore = Math.min(streakWeeks * 8, 200);
  const assessmentScore = Math.min(selfAssessmentScore, 100);
  return Math.round(sessionScore + keywordScore + reflectionScore + streakScore + assessmentScore);
}

/** 성장 지수 → 나무 레벨(1~10) */
export function growthIndexToTreeLevel(index: number): number {
  if (index < 50) return 1;   // 씨앗
  if (index < 150) return 2;  // 새싹
  if (index < 250) return 3;  // 어린 나무
  if (index < 400) return 4;  // 성장 중
  if (index < 550) return 5;  // 청년 나무
  if (index < 650) return 6;  // 무성한 나무
  if (index < 750) return 7;  // 열매 맺는 나무
  if (index < 850) return 8;  // 거목
  if (index < 950) return 9;  // 신목
  return 10;                  // 세계수
}

export const TREE_LEVEL_NAMES = [
  "", "씨앗", "새싹", "어린 나무", "성장 중", "청년 나무",
  "무성한 나무", "열매 맺는 나무", "거목", "신목", "세계수 🌳",
];

export const EMOTION_LABELS: Record<string, string> = {
  excited: "🔥 설레는",
  focused: "🎯 집중되는",
  confused: "🤔 혼란스러운",
  tired: "😴 피곤한",
  inspired: "✨ 영감받은",
  satisfied: "😊 뿌듯한",
};

export const DAY_TYPE_LABELS: Record<string, string> = {
  friday_evening: "금요일 저녁",
  saturday_morning: "토요일 오전",
  saturday_afternoon: "토요일 오후",
  saturday_evening: "토요일 저녁",
};
