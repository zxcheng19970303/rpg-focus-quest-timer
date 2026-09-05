import { ACTIVITY_SUGGESTIONS } from "@/lib/focus-rules";
import type { LastReward } from "./ProgressBoard";

type ActivityReminderProps = {
  reward: LastReward;
  onNextRound: () => void;
  onDismiss: () => void;
};

export default function ActivityReminder({
  reward,
  onNextRound,
  onDismiss,
}: ActivityReminderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-3xl border border-gold/40 bg-surface-strong p-6 shadow-xl sm:p-8"
    >
      <p className="text-lg font-semibold text-foreground">
        本回合完成！你獲得了{" "}
        <span className="font-mono text-gold">{reward.xpEarned}</span> XP
      </p>

      {reward.bonusApplied ? (
        <p className="mt-1 text-sm font-medium text-success">不中斷獎勵 +10 XP</p>
      ) : null}

      <div className="mt-5">
        <p className="text-sm font-medium text-muted">起身活動一下：</p>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm text-foreground">
          {ACTIVITY_SUGGESTIONS.map((suggestion) => (
            <li key={suggestion} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-gold">
                ✦
              </span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onNextRound}
          className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-coral-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          再來一回合
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full border border-border-subtle bg-transparent px-6 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-gold/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          稍後再說
        </button>
      </div>
    </div>
  );
}
