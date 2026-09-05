"use client";

import { useEffect, useRef, useState } from "react";
import { FOCUS_MINUTE_OPTIONS, type FocusMinutes } from "@/lib/focus-rules";

type TimerStatus = "idle" | "running" | "paused" | "completed";

type FocusTimerProps = {
  resetToken: number;
  onSessionComplete: (result: { minutes: FocusMinutes; hasPaused: boolean }) => void;
};

const DEFAULT_MINUTES: FocusMinutes = 1;

function minutesToMs(minutes: FocusMinutes): number {
  return minutes * 60 * 1000;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const STATUS_LABEL: Record<TimerStatus, string> = {
  idle: "尚未開始",
  running: "專注進行中",
  paused: "已暫停",
  completed: "本回合已完成",
};

export default function FocusTimer({ resetToken, onSessionComplete }: FocusTimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<FocusMinutes>(DEFAULT_MINUTES);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingMs, setRemainingMs] = useState<number>(minutesToMs(DEFAULT_MINUTES));

  const endAtRef = useRef<number | null>(null);
  const pausedRemainingMsRef = useRef<number>(minutesToMs(DEFAULT_MINUTES));
  const hasPausedRef = useRef(false);
  const sessionIdRef = useRef(0);
  const awardedSessionIdRef = useRef<number | null>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (status !== "running" || endAtRef.current == null) {
      return;
    }

    const tick = () => {
      const endAt = endAtRef.current;
      if (endAt == null) return;
      const remaining = Math.max(0, endAt - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) {
        setStatus("completed");
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    if (status === "completed" && awardedSessionIdRef.current !== sessionIdRef.current) {
      awardedSessionIdRef.current = sessionIdRef.current;
      onSessionComplete({ minutes: selectedMinutes, hasPaused: hasPausedRef.current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    resetToIdle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  function startFocus() {
    if (status !== "idle") return;
    sessionIdRef.current += 1;
    hasPausedRef.current = false;
    const durationMs = minutesToMs(selectedMinutes);
    endAtRef.current = Date.now() + durationMs;
    setRemainingMs(durationMs);
    setStatus("running");
  }

  function pauseFocus() {
    if (status !== "running" || endAtRef.current == null) return;
    const remaining = Math.max(0, endAtRef.current - Date.now());
    pausedRemainingMsRef.current = remaining;
    hasPausedRef.current = true;
    endAtRef.current = null;
    setRemainingMs(remaining);
    setStatus("paused");
  }

  function resumeFocus() {
    if (status !== "paused") return;
    endAtRef.current = Date.now() + pausedRemainingMsRef.current;
    setStatus("running");
  }

  function resetToIdle() {
    endAtRef.current = null;
    hasPausedRef.current = false;
    const durationMs = minutesToMs(selectedMinutes);
    pausedRemainingMsRef.current = durationMs;
    setRemainingMs(durationMs);
    setStatus("idle");
  }

  function selectMinutes(minutes: FocusMinutes) {
    if (status !== "idle") return;
    setSelectedMinutes(minutes);
    setRemainingMs(minutesToMs(minutes));
    pausedRemainingMsRef.current = minutesToMs(minutes);
  }

  const totalMs = minutesToMs(selectedMinutes);
  const progressRatio = totalMs === 0 ? 0 : Math.min(1, 1 - remainingMs / totalMs);

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-foreground">番茄鐘</h3>
        <p role="status" aria-live="polite" className="text-sm font-medium text-gold">
          {STATUS_LABEL[status]}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="選擇專注時間">
        {FOCUS_MINUTE_OPTIONS.map((minutes) => {
          const isSelected = minutes === selectedMinutes;
          const isDisabled = status !== "idle";
          return (
            <button
              key={minutes}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => selectMinutes(minutes)}
              className={`min-w-[4.5rem] rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                isSelected
                  ? "border-gold bg-gold text-background"
                  : "border-border-subtle bg-transparent text-muted hover:border-gold/60 hover:text-foreground"
              } ${isDisabled && !isSelected ? "cursor-not-allowed opacity-40" : ""} ${
                isDisabled && isSelected ? "cursor-not-allowed opacity-80" : ""
              }`}
            >
              {minutes} 分鐘
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p
          aria-live="off"
          className="font-mono text-6xl font-bold tabular-nums text-foreground sm:text-7xl"
        >
          {formatRemaining(remainingMs)}
        </p>

        <div
          className="h-3 w-full max-w-sm overflow-hidden rounded-full bg-background"
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="本回合倒數進度"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-300 ease-linear"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={startFocus}
          disabled={status !== "idle"}
          className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-coral-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:bg-surface-strong disabled:text-muted disabled:opacity-60"
        >
          開始專注
        </button>
        <button
          type="button"
          onClick={pauseFocus}
          disabled={status !== "running"}
          className="rounded-full border border-border-subtle bg-transparent px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-gold/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          暫停
        </button>
        <button
          type="button"
          onClick={resumeFocus}
          disabled={status !== "paused"}
          className="rounded-full border border-border-subtle bg-transparent px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-gold/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          繼續專注
        </button>
        <button
          type="button"
          onClick={resetToIdle}
          disabled={status === "idle"}
          className="rounded-full border border-border-subtle bg-transparent px-6 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-coral/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          重設
        </button>
      </div>
    </div>
  );
}
