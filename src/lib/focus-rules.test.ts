import test from "node:test";
import assert from "node:assert/strict";
import {
  addDailyFocusRecord,
  buildLast30DaysSeries,
  calculateEarnedXp,
  getLevelInfo,
  getLocalDateKey,
} from "./focus-rules.ts";

test("1 分鐘未暫停完成，得到 11 XP", () => {
  assert.equal(calculateEarnedXp(1, false), 11);
});

test("25 分鐘未暫停完成，得到 35 XP", () => {
  assert.equal(calculateEarnedXp(25, false), 35);
});

test("25 分鐘曾暫停後完成，得到 25 XP", () => {
  assert.equal(calculateEarnedXp(25, true), 25);
});

test("50 分鐘未暫停完成，得到 70 XP", () => {
  assert.equal(calculateEarnedXp(50, false), 70);
});

test("90 分鐘未暫停完成，得到 130 XP", () => {
  assert.equal(calculateEarnedXp(90, false), 130);
});

test("XP 99 完成 1 分鐘未暫停回合後，等級變成 Lv.2", () => {
  const nextTotalXp = 99 + calculateEarnedXp(1, false);
  const info = getLevelInfo(nextTotalXp);
  assert.equal(info.level, 2);
  assert.equal(info.title, "節奏建立者");
});

test("XP 299 完成 1 分鐘未暫停回合後，等級變成 Lv.3", () => {
  const nextTotalXp = 299 + calculateEarnedXp(1, false);
  const info = getLevelInfo(nextTotalXp);
  assert.equal(info.level, 3);
  assert.equal(info.title, "深度工作者");
});

test("0 XP 時為 Lv.1 專注新手，且尚未達下一級", () => {
  const info = getLevelInfo(0);
  assert.equal(info.level, 1);
  assert.equal(info.title, "專注新手");
  assert.equal(info.isMaxLevel, false);
  assert.equal(info.xpNeededForNextLevel, 100);
});

test("超過 1000 XP 仍維持 Lv.5，且標示為最高稱號", () => {
  const info = getLevelInfo(1500);
  assert.equal(info.level, 5);
  assert.equal(info.title, "專注大師");
  assert.equal(info.isMaxLevel, true);
  assert.equal(info.xpNeededForNextLevel, null);
  assert.equal(info.progressRatio, 1);
});

test("恰好落在門檻值時立即升級", () => {
  assert.equal(getLevelInfo(100).level, 2);
  assert.equal(getLevelInfo(99).level, 1);
});

test("同一天完成第二回合時，每日紀錄會累加而不是覆蓋", () => {
  const afterFirst = addDailyFocusRecord([], {
    date: "2026-09-05",
    minutes: 25,
    xpEarned: 35,
  });
  const afterSecond = addDailyFocusRecord(afterFirst, {
    date: "2026-09-05",
    minutes: 50,
    xpEarned: 70,
  });

  assert.deepEqual(afterSecond, [
    { date: "2026-09-05", minutesFocused: 75, xpEarned: 105, sessionsCompleted: 2 },
  ]);
});

test("不同天完成回合會各自新增一筆紀錄，並依日期排序", () => {
  const history = addDailyFocusRecord(
    addDailyFocusRecord([], { date: "2026-09-05", minutes: 25, xpEarned: 35 }),
    { date: "2026-09-04", minutes: 1, xpEarned: 11 },
  );

  assert.deepEqual(history, [
    { date: "2026-09-04", minutesFocused: 1, xpEarned: 11, sessionsCompleted: 1 },
    { date: "2026-09-05", minutesFocused: 25, xpEarned: 35, sessionsCompleted: 1 },
  ]);
});

test("每日紀錄只保留最近 30 天", () => {
  let history: ReturnType<typeof addDailyFocusRecord> = [];
  for (let dayOffset = 0; dayOffset < 35; dayOffset += 1) {
    const date = getLocalDateKey(new Date(2026, 0, 1 + dayOffset));
    history = addDailyFocusRecord(history, { date, minutes: 1, xpEarned: 11 });
  }
  assert.equal(history.length, 30);
  assert.equal(history[0].date, getLocalDateKey(new Date(2026, 0, 6)));
  assert.equal(history[29].date, getLocalDateKey(new Date(2026, 1, 4)));
});

test("buildLast30DaysSeries 會補齊沒有紀錄的日期為 0，且依時間由舊到新排序", () => {
  const referenceDate = new Date(2026, 8, 6);
  const history = [
    { date: "2026-09-06", minutesFocused: 25, xpEarned: 35, sessionsCompleted: 1 },
    { date: "2026-08-01", minutesFocused: 90, xpEarned: 130, sessionsCompleted: 1 },
  ];

  const series = buildLast30DaysSeries(history, referenceDate);

  assert.equal(series.length, 30);
  assert.equal(series[29].date, "2026-09-06");
  assert.equal(series[29].minutesFocused, 25);
  assert.equal(series[0].date, getLocalDateKey(new Date(2026, 7, 8)));
  assert.equal(series[0].minutesFocused, 0);
});
