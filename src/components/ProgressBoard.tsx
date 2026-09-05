import type { FocusMinutes, LevelInfo } from "@/lib/focus-rules";

export type LastReward = {
  minutes: FocusMinutes;
  xpEarned: number;
  bonusApplied: boolean;
};

type ProgressBoardProps = {
  levelInfo: LevelInfo;
  lastReward: LastReward | null;
};

export default function ProgressBoard({ levelInfo, lastReward }: ProgressBoardProps) {
  const {
    level,
    title,
    totalXp,
    xpNeededForNextLevel,
    progressRatio,
    isMaxLevel,
  } = levelInfo;

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-xl sm:p-8">
      <h3 className="text-lg font-semibold text-foreground">遠征進度</h3>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-sm font-bold text-background">
            Lv.{level}
          </span>
          <span className="ml-3 text-base font-medium text-foreground">{title}</span>
        </div>
        <p className="text-sm text-muted">
          累積 <span className="font-mono font-semibold text-gold">{totalXp}</span> XP
        </p>
      </div>

      <div className="mt-4">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-background"
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="等級進度"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {isMaxLevel
            ? "已達最高稱號：專注大師"
            : `距離下一級還需要 ${xpNeededForNextLevel} XP`}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border-subtle bg-background/40 p-4">
        <p className="text-sm font-medium text-muted">最近一次完成獲得的 XP 回饋</p>
        {lastReward ? (
          <p className="mt-1 text-base text-foreground">
            {lastReward.minutes} 分鐘專注 → 獲得{" "}
            <span className="font-mono font-semibold text-gold">
              {lastReward.xpEarned} XP
            </span>
            {lastReward.bonusApplied ? (
              <span className="ml-2 text-sm text-success">（含不中斷獎勵 +10 XP）</span>
            ) : null}
          </p>
        ) : (
          <p className="mt-1 text-base text-foreground">尚未完成任何回合，開始第一次專注吧！</p>
        )}
      </div>
    </div>
  );
}
