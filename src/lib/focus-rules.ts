export const FOCUS_MINUTE_OPTIONS = [1, 5, 15, 25, 60, 90] as const;

export const MIN_CUSTOM_FOCUS_MINUTES = 1;
export const MAX_CUSTOM_FOCUS_MINUTES = 180;

export type FocusMinutes = number;

export function isValidFocusMinutes(value: number): value is FocusMinutes {
  return (
    Number.isInteger(value) &&
    value >= MIN_CUSTOM_FOCUS_MINUTES &&
    value <= MAX_CUSTOM_FOCUS_MINUTES
  );
}

export function clampFocusMinutes(value: number): FocusMinutes {
  const rounded = Math.round(value);
  return Math.min(MAX_CUSTOM_FOCUS_MINUTES, Math.max(MIN_CUSTOM_FOCUS_MINUTES, rounded));
}

const UNINTERRUPTED_BONUS_XP = 10;

export function calculateEarnedXp(minutes: FocusMinutes, hasPaused: boolean): number {
  // 基本 XP 與專注分鐘數成正比（1 分鐘 = 1 XP），才能同時支援自訂時間。
  const baseXp = minutes;
  return baseXp + (hasPaused ? 0 : UNINTERRUPTED_BONUS_XP);
}

export type LevelDefinition = {
  level: number;
  minXp: number;
  title: string;
};

export const LEVEL_DEFINITIONS: readonly LevelDefinition[] = [
  { level: 1, minXp: 0, title: "專注新手" },
  { level: 2, minXp: 100, title: "節奏建立者" },
  { level: 3, minXp: 300, title: "深度工作者" },
  { level: 4, minXp: 600, title: "心流實踐者" },
  { level: 5, minXp: 1000, title: "專注大師" },
];

export type LevelInfo = {
  level: number;
  title: string;
  totalXp: number;
  currentLevelMinXp: number;
  nextLevelMinXp: number | null;
  xpIntoLevel: number;
  xpNeededForNextLevel: number | null;
  progressRatio: number;
  isMaxLevel: boolean;
};

export function getLevelInfo(totalXp: number): LevelInfo {
  let currentIndex = 0;
  for (let i = 0; i < LEVEL_DEFINITIONS.length; i += 1) {
    if (totalXp >= LEVEL_DEFINITIONS[i].minXp) {
      currentIndex = i;
    } else {
      break;
    }
  }

  const current = LEVEL_DEFINITIONS[currentIndex];
  const next = LEVEL_DEFINITIONS[currentIndex + 1] ?? null;
  const isMaxLevel = next === null;
  const xpIntoLevel = totalXp - current.minXp;
  const xpSpanForLevel = next ? next.minXp - current.minXp : 0;

  return {
    level: current.level,
    title: current.title,
    totalXp,
    currentLevelMinXp: current.minXp,
    nextLevelMinXp: next ? next.minXp : null,
    xpIntoLevel,
    xpNeededForNextLevel: next ? next.minXp - totalXp : null,
    progressRatio: isMaxLevel ? 1 : Math.min(1, xpIntoLevel / xpSpanForLevel),
    isMaxLevel,
  };
}

export const ACTIVITY_SUGGESTIONS: readonly string[] = [
  "起身走動一下",
  "伸展肩頸或手腕",
  "喝水並讓眼睛離開螢幕",
];

export const FOCUS_HISTORY_DAYS = 30;

export type DailyFocusEntry = {
  date: string;
  minutesFocused: number;
  xpEarned: number;
  sessionsCompleted: number;
};

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDailyFocusRecord(
  history: readonly DailyFocusEntry[],
  record: { date: string; minutes: number; xpEarned: number },
): DailyFocusEntry[] {
  const existingIndex = history.findIndex((entry) => entry.date === record.date);
  const next = [...history];

  if (existingIndex >= 0) {
    const existing = next[existingIndex];
    next[existingIndex] = {
      date: record.date,
      minutesFocused: existing.minutesFocused + record.minutes,
      xpEarned: existing.xpEarned + record.xpEarned,
      sessionsCompleted: existing.sessionsCompleted + 1,
    };
  } else {
    next.push({
      date: record.date,
      minutesFocused: record.minutes,
      xpEarned: record.xpEarned,
      sessionsCompleted: 1,
    });
  }

  next.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return next.slice(-FOCUS_HISTORY_DAYS);
}

export function buildLast30DaysSeries(
  history: readonly DailyFocusEntry[],
  referenceDate: Date = new Date(),
): DailyFocusEntry[] {
  const historyByDate = new Map(history.map((entry) => [entry.date, entry]));
  const series: DailyFocusEntry[] = [];

  for (let offset = FOCUS_HISTORY_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - offset,
    );
    const dateKey = getLocalDateKey(day);
    series.push(
      historyByDate.get(dateKey) ?? {
        date: dateKey,
        minutesFocused: 0,
        xpEarned: 0,
        sessionsCompleted: 0,
      },
    );
  }

  return series;
}
