"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDailyFocusRecord,
  buildLast30DaysSeries,
  calculateEarnedXp,
  getLevelInfo,
  getLocalDateKey,
  type DailyFocusEntry,
  type FocusMinutes,
} from "@/lib/focus-rules";
import { DEFAULT_PERSISTED_STATE, loadPersistedState, savePersistedState } from "@/lib/storage";
import FocusTimer from "./FocusTimer";
import ProgressBoard, { type LastReward } from "./ProgressBoard";
import ActivityReminder from "./ActivityReminder";
import FocusHistoryChart from "./FocusHistoryChart";

export default function FocusQuestApp() {
  const [totalXp, setTotalXp] = useState(DEFAULT_PERSISTED_STATE.totalXp);
  const [completedSessions, setCompletedSessions] = useState(
    DEFAULT_PERSISTED_STATE.completedSessions,
  );
  const [dailyHistory, setDailyHistory] = useState<DailyFocusEntry[]>(
    DEFAULT_PERSISTED_STATE.dailyHistory,
  );
  const [lastReward, setLastReward] = useState<LastReward | null>(null);
  const [isReminderVisible, setIsReminderVisible] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    // localStorage 只能在 client mount 後讀取；若在渲染期間讀取，會與 SSR 輸出不一致而造成 hydration mismatch。
    /* eslint-disable react-hooks/set-state-in-effect */
    const persisted = loadPersistedState();
    setTotalXp(persisted.totalXp);
    setCompletedSessions(persisted.completedSessions);
    setDailyHistory(persisted.dailyHistory);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function handleSessionComplete({
    minutes,
    hasPaused,
  }: {
    minutes: FocusMinutes;
    hasPaused: boolean;
  }) {
    const xpEarned = calculateEarnedXp(minutes, hasPaused);
    const nextTotalXp = totalXp + xpEarned;
    const nextCompletedSessions = completedSessions + 1;
    const nextDailyHistory = addDailyFocusRecord(dailyHistory, {
      date: getLocalDateKey(new Date()),
      minutes,
      xpEarned,
    });

    setTotalXp(nextTotalXp);
    setCompletedSessions(nextCompletedSessions);
    setDailyHistory(nextDailyHistory);
    savePersistedState({
      totalXp: nextTotalXp,
      completedSessions: nextCompletedSessions,
      dailyHistory: nextDailyHistory,
    });

    setLastReward({ minutes, xpEarned, bonusApplied: !hasPaused });
    setIsReminderVisible(true);
  }

  function handleNextRound() {
    setIsReminderVisible(false);
    setResetToken((token) => token + 1);
  }

  function handleDismissReminder() {
    setIsReminderVisible(false);
  }

  const levelInfo = getLevelInfo(totalXp);
  const historySeries = useMemo(() => buildLast30DaysSeries(dailyHistory), [dailyHistory]);

  return (
    <section id="focus-timer" className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <FocusTimer resetToken={resetToken} onSessionComplete={handleSessionComplete} />
        <ProgressBoard levelInfo={levelInfo} lastReward={lastReward} />
      </div>

      <div className="mt-6">
        <FocusHistoryChart series={historySeries} />
      </div>

      {isReminderVisible && lastReward ? (
        <div className="mt-6">
          <ActivityReminder
            reward={lastReward}
            onNextRound={handleNextRound}
            onDismiss={handleDismissReminder}
          />
        </div>
      ) : null}
    </section>
  );
}
