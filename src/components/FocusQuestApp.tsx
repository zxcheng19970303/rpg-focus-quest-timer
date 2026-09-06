"use client";

import { useEffect, useState } from "react";
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

// buildLast30DaysSeries() 的 referenceDate 預設是 new Date()；若在 render 階段呼叫，
// 靜態預渲染的 server 輸出（凍結在 build 當下）跟 client hydrate 當下的日期幾乎必然不同，
// 會讓圖表 X 軸日期文字節點不一致而觸發 React hydration mismatch（error #418）。
// 用固定日期算出的常數當作 SSR 安全的初始樣板，真正「今天」的資料一律只在 client mount 後
// 的 effect／事件處理常式裡計算並塞進 state，絕不在 render 期間呼叫 new Date()。
const SSR_SAFE_PLACEHOLDER_DATE = new Date(2000, 0, 1);
const EMPTY_HISTORY_SERIES: DailyFocusEntry[] = buildLast30DaysSeries([], SSR_SAFE_PLACEHOLDER_DATE);

export default function FocusQuestApp() {
  const [totalXp, setTotalXp] = useState(DEFAULT_PERSISTED_STATE.totalXp);
  const [completedSessions, setCompletedSessions] = useState(
    DEFAULT_PERSISTED_STATE.completedSessions,
  );
  const [dailyHistory, setDailyHistory] = useState<DailyFocusEntry[]>(
    DEFAULT_PERSISTED_STATE.dailyHistory,
  );
  const [historySeries, setHistorySeries] = useState<DailyFocusEntry[]>(EMPTY_HISTORY_SERIES);
  const [lastReward, setLastReward] = useState<LastReward | null>(null);
  const [isReminderVisible, setIsReminderVisible] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    // localStorage 與「今天」都只能在 client mount 後讀取／計算；
    // 若在渲染期間讀取，會與 SSR 輸出不一致而造成 hydration mismatch。
    /* eslint-disable react-hooks/set-state-in-effect */
    const persisted = loadPersistedState();
    setTotalXp(persisted.totalXp);
    setCompletedSessions(persisted.completedSessions);
    setDailyHistory(persisted.dailyHistory);
    setHistorySeries(buildLast30DaysSeries(persisted.dailyHistory, new Date()));
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
    const now = new Date();
    const nextDailyHistory = addDailyFocusRecord(dailyHistory, {
      date: getLocalDateKey(now),
      minutes,
      xpEarned,
    });

    setTotalXp(nextTotalXp);
    setCompletedSessions(nextCompletedSessions);
    setDailyHistory(nextDailyHistory);
    setHistorySeries(buildLast30DaysSeries(nextDailyHistory, now));
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
