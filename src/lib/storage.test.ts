import test from "node:test";
import assert from "node:assert/strict";

class FakeLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  clear(): void {
    this.store.clear();
  }
}

const fakeLocalStorage = new FakeLocalStorage();
(globalThis as unknown as { window: { localStorage: FakeLocalStorage } }).window = {
  localStorage: fakeLocalStorage,
};

const { loadPersistedState, savePersistedState, DEFAULT_PERSISTED_STATE } = await import(
  "./storage.ts"
);

test("沒有資料時回傳預設狀態（0 XP、0 次完成）", () => {
  fakeLocalStorage.clear();
  assert.deepEqual(loadPersistedState(), DEFAULT_PERSISTED_STATE);
});

test("完成回合後寫入的資料可以正確讀回", () => {
  fakeLocalStorage.clear();
  savePersistedState({ totalXp: 35, completedSessions: 1, dailyHistory: [] });
  assert.deepEqual(loadPersistedState(), {
    totalXp: 35,
    completedSessions: 1,
    dailyHistory: [],
  });
});

test("損毀的 JSON 不會讓程式崩潰，安全回到預設狀態", () => {
  fakeLocalStorage.clear();
  fakeLocalStorage.setItem("focus-quest-timer:v1", "{not valid json");
  assert.deepEqual(loadPersistedState(), DEFAULT_PERSISTED_STATE);
});

test("格式不正確（缺欄位／負數）時安全回到預設狀態", () => {
  fakeLocalStorage.clear();
  fakeLocalStorage.setItem("focus-quest-timer:v1", JSON.stringify({ totalXp: -5 }));
  assert.deepEqual(loadPersistedState(), DEFAULT_PERSISTED_STATE);

  fakeLocalStorage.clear();
  fakeLocalStorage.setItem("focus-quest-timer:v1", JSON.stringify({ foo: "bar" }));
  assert.deepEqual(loadPersistedState(), DEFAULT_PERSISTED_STATE);
});

test("每日紀錄格式錯誤時，只清空每日紀錄，仍保留正確的 XP 與完成次數", () => {
  fakeLocalStorage.clear();
  fakeLocalStorage.setItem(
    "focus-quest-timer:v1",
    JSON.stringify({ totalXp: 50, completedSessions: 2, dailyHistory: "not-an-array" }),
  );
  assert.deepEqual(loadPersistedState(), {
    totalXp: 50,
    completedSessions: 2,
    dailyHistory: [],
  });
});

test("每日紀錄中混雜無效項目時，會被過濾掉，只保留合法項目", () => {
  fakeLocalStorage.clear();
  fakeLocalStorage.setItem(
    "focus-quest-timer:v1",
    JSON.stringify({
      totalXp: 10,
      completedSessions: 1,
      dailyHistory: [
        { date: "2026-09-01", minutesFocused: 25, xpEarned: 35, sessionsCompleted: 1 },
        { date: "invalid-date", minutesFocused: 25, xpEarned: 35, sessionsCompleted: 1 },
        { date: "2026-09-02", minutesFocused: -5, xpEarned: 35, sessionsCompleted: 1 },
      ],
    }),
  );
  assert.deepEqual(loadPersistedState(), {
    totalXp: 10,
    completedSessions: 1,
    dailyHistory: [
      { date: "2026-09-01", minutesFocused: 25, xpEarned: 35, sessionsCompleted: 1 },
    ],
  });
});
