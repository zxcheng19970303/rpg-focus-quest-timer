import {
  FOCUS_HISTORY_DAYS,
  isFocusMinutes,
  type DailyFocusEntry,
  type FocusMinutes,
} from "./focus-rules.ts";

export type PersistedFocusState = {
  totalXp: number;
  completedSessions: number;
  lastSelectedMinutes?: FocusMinutes;
  dailyHistory: DailyFocusEntry[];
};

const STORAGE_KEY = "focus-quest-timer:v1";

export const DEFAULT_PERSISTED_STATE: PersistedFocusState = {
  totalXp: 0,
  completedSessions: 0,
  dailyHistory: [],
};

function isValidCoreState(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  const hasValidTotalXp =
    typeof candidate.totalXp === "number" &&
    Number.isFinite(candidate.totalXp) &&
    candidate.totalXp >= 0;

  const hasValidCompletedSessions =
    typeof candidate.completedSessions === "number" &&
    Number.isFinite(candidate.completedSessions) &&
    candidate.completedSessions >= 0;

  if (!hasValidTotalXp || !hasValidCompletedSessions) {
    return false;
  }

  if (
    candidate.lastSelectedMinutes !== undefined &&
    (typeof candidate.lastSelectedMinutes !== "number" ||
      !isFocusMinutes(candidate.lastSelectedMinutes))
  ) {
    return false;
  }

  return true;
}

function isValidDailyEntry(value: unknown): value is DailyFocusEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(candidate.date) &&
    typeof candidate.minutesFocused === "number" &&
    Number.isFinite(candidate.minutesFocused) &&
    candidate.minutesFocused >= 0 &&
    typeof candidate.xpEarned === "number" &&
    Number.isFinite(candidate.xpEarned) &&
    candidate.xpEarned >= 0 &&
    typeof candidate.sessionsCompleted === "number" &&
    Number.isFinite(candidate.sessionsCompleted) &&
    candidate.sessionsCompleted >= 0
  );
}

function sanitizeDailyHistory(value: unknown): DailyFocusEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isValidDailyEntry).slice(-FOCUS_HISTORY_DAYS);
}

export function loadPersistedState(): PersistedFocusState {
  if (typeof window === "undefined") {
    return DEFAULT_PERSISTED_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PERSISTED_STATE;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isValidCoreState(parsed)) {
      return DEFAULT_PERSISTED_STATE;
    }

    return {
      totalXp: parsed.totalXp as number,
      completedSessions: parsed.completedSessions as number,
      dailyHistory: sanitizeDailyHistory(parsed.dailyHistory),
      ...(parsed.lastSelectedMinutes !== undefined
        ? { lastSelectedMinutes: parsed.lastSelectedMinutes as FocusMinutes }
        : {}),
    };
  } catch {
    return DEFAULT_PERSISTED_STATE;
  }
}

export function savePersistedState(state: PersistedFocusState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage 無法寫入（例如無痕模式容量限制）時，安靜略過，不影響當次操作。
  }
}
