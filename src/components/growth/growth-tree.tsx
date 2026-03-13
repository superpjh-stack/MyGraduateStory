"use client";

import { motion } from "framer-motion";
import { TREE_LEVEL_NAMES } from "@/lib/utils";

interface GrowthTreeProps {
  level: number;       // 1~10
  growthIndex: number; // 0~1000
  season?: string;
}

const LEVEL_CONFIGS = [
  { emoji: "🌰", label: "씨앗",        size: 24, leaves: 0 },
  { emoji: "🌱", label: "새싹",        size: 32, leaves: 0 },
  { emoji: "🌿", label: "어린 나무",   size: 40, leaves: 2 },
  { emoji: "🌳", label: "성장 중",     size: 52, leaves: 4 },
  { emoji: "🌳", label: "청년 나무",   size: 64, leaves: 6 },
  { emoji: "🌲", label: "무성한 나무", size: 80, leaves: 8 },
  { emoji: "🍎", label: "열매",        size: 88, leaves: 10 },
  { emoji: "🌲", label: "거목",        size: 96, leaves: 12 },
  { emoji: "✨🌲", label: "신목",      size: 104, leaves: 14 },
  { emoji: "🌳✨", label: "세계수",   size: 120, leaves: 16 },
];

const SEASON_COLORS: Record<string, { trunk: string; leaves: string; ground: string }> = {
  spring: { trunk: "#8B6914", leaves: "#4CAF50", ground: "#81C784" },
  summer: { trunk: "#6D4C41", leaves: "#2E7D32", ground: "#43A047" },
  autumn: { trunk: "#5D4037", leaves: "#E64A19", ground: "#A5D6A7" },
  winter: { trunk: "#78909C", leaves: "#B0BEC5", ground: "#ECEFF1" },
};

export function GrowthTree({ level, growthIndex, season = "spring" }: GrowthTreeProps) {
  const idx = Math.min(Math.max(level - 1, 0), 9);
  const config = LEVEL_CONFIGS[idx];
  const colors = SEASON_COLORS[season] ?? SEASON_COLORS.spring;
  const progress = ((growthIndex % 100) / 100) * 100;
  const levelName = TREE_LEVEL_NAMES[level];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 나무 SVG */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative flex items-end justify-center"
        style={{ height: 160, width: 160 }}
      >
        <svg viewBox="0 0 160 160" width="160" height="160" className="absolute inset-0">
          {/* 땅 */}
          <ellipse cx="80" cy="148" rx="50" ry="8" fill={colors.ground} opacity={0.4} />

          {level >= 2 && (
            <>
              {/* 줄기 */}
              <motion.rect
                x="74"
                y={160 - config.size}
                width="12"
                height={config.size - 10}
                rx="4"
                fill={colors.trunk}
                initial={{ scaleY: 0, transformOrigin: "bottom" }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8 }}
                style={{ transformOrigin: "80px 148px" }}
              />

              {/* 잎 / 크라운 */}
              {level >= 3 && (
                <motion.ellipse
                  cx="80"
                  cy={160 - config.size + 10}
                  rx={config.size / 2.2}
                  ry={config.size / 2.8}
                  fill={colors.leaves}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  style={{ transformOrigin: "80px 80px" }}
                  className="animate-leaf-sway"
                />
              )}

              {/* 열매 (레벨 7+) */}
              {level >= 7 && [45, 80, 115].map((x, i) => (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={160 - config.size + 20 + (i % 2) * 10}
                  r="5"
                  fill="#E64A19"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                />
              ))}
            </>
          )}

          {/* 씨앗 (레벨 1) */}
          {level === 1 && (
            <motion.text
              x="80"
              y="110"
              textAnchor="middle"
              fontSize="48"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {config.emoji}
            </motion.text>
          )}
        </svg>
      </motion.div>

      {/* 레벨 표시 */}
      <div className="text-center space-y-1">
        <div className="text-2xl font-bold text-forest-700">Lv.{level}</div>
        <div className="text-sm font-medium text-forest-600">{levelName}</div>
        <div className="text-xs text-muted-foreground">성장 지수 {growthIndex} / 1000</div>
      </div>

      {/* 다음 레벨 프로그레스 */}
      {level < 10 && (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>다음 레벨까지</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="h-2 bg-forest-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {level === 10 && (
        <div className="text-center text-sm font-serif text-forest-600">
          🎓 축하합니다! 최고 레벨 달성!
        </div>
      )}
    </div>
  );
}
