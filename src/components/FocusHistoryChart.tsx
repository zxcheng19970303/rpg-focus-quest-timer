import type { DailyFocusEntry } from "@/lib/focus-rules";

type FocusHistoryChartProps = {
  series: DailyFocusEntry[];
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 30, left: 12 };

function formatShortDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export default function FocusHistoryChart({ series }: FocusHistoryChartProps) {
  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const slotWidth = innerWidth / series.length;
  const barWidth = Math.max(2, slotWidth * 0.5);

  const maxMinutes = Math.max(1, ...series.map((entry) => entry.minutesFocused));
  const maxXp = Math.max(1, ...series.map((entry) => entry.xpEarned));

  const bars = series.map((entry, index) => {
    const rawHeight = (entry.minutesFocused / maxMinutes) * innerHeight;
    const height = entry.minutesFocused > 0 ? Math.max(rawHeight, 2) : 0;
    const x = PADDING.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = PADDING.top + innerHeight - height;
    return { x, y, height, entry };
  });

  const linePoints = series.map((entry, index) => {
    const x = PADDING.left + index * slotWidth + slotWidth / 2;
    const y = PADDING.top + innerHeight - (entry.xpEarned / maxXp) * innerHeight;
    return { x, y };
  });

  const polylinePoints = linePoints.map((point) => `${point.x},${point.y}`).join(" ");

  const labelIndexes = series
    .map((_, index) => index)
    .filter((index) => index % 5 === 0 || index === series.length - 1);

  const totals = series.reduce(
    (acc, entry) => ({
      minutes: acc.minutes + entry.minutesFocused,
      xp: acc.xp + entry.xpEarned,
      sessions: acc.sessions + entry.sessionsCompleted,
    }),
    { minutes: 0, xp: 0, sessions: 0 },
  );

  return (
    <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-xl sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">近 30 天專注紀錄</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-coral" />
            專注分鐘
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-gold" />
            當日 XP
          </span>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted">
        共專注 <span className="font-mono text-foreground">{totals.minutes}</span> 分鐘・完成{" "}
        <span className="font-mono text-foreground">{totals.sessions}</span> 回合・獲得{" "}
        <span className="font-mono text-gold">{totals.xp}</span> XP
      </p>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`近 30 天專注紀錄圖表：共專注 ${totals.minutes} 分鐘，完成 ${totals.sessions} 回合，獲得 ${totals.xp} XP`}
        className="mt-4 w-full"
      >
        {[0, 0.5, 1].map((ratio) => {
          const y = PADDING.top + innerHeight * (1 - ratio);
          return (
            <line
              key={ratio}
              x1={PADDING.left}
              x2={CHART_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="var(--color-border-subtle)"
              strokeWidth={1}
            />
          );
        })}

        {bars.map((bar, index) => (
          <rect
            key={series[index].date}
            x={bar.x}
            y={bar.y}
            width={barWidth}
            height={bar.height}
            rx={2}
            fill="var(--color-coral)"
            opacity={0.85}
          />
        ))}

        <polyline
          points={polylinePoints}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {linePoints.map((point, index) => (
          <circle key={series[index].date} cx={point.x} cy={point.y} r={2.2} fill="var(--color-gold)" />
        ))}

        {labelIndexes.map((index) => (
          <text
            key={series[index].date}
            x={PADDING.left + index * slotWidth + slotWidth / 2}
            y={CHART_HEIGHT - PADDING.bottom + 16}
            textAnchor="middle"
            fontSize={10}
            fill="var(--color-muted)"
          >
            {formatShortDate(series[index].date)}
          </text>
        ))}
      </svg>

      <p className="mt-2 text-xs text-muted">
        長條（專注分鐘）與折線（當日 XP）分別依各自區間縮放，用於觀察趨勢，非相同單位。
      </p>
    </div>
  );
}
