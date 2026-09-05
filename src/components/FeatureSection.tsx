import type { ReactNode } from "react";

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "自訂專注節奏",
    description: "依照工作或學習情境，從 1、25、50 到 90 分鐘中選擇最適合的專注時間。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 9v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 3h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "專注也能升級",
    description: "完成一回合就累積經驗值，等級與稱號會隨著累積的 XP 自動提升。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4-3.9-3.8 5.4-.8L12 3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "記得起身活動",
    description: "每次專注結束都會提醒你走動、伸展或喝水，兼顧專注與身體健康。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M12 21c-3-2.5-7-6-7-10a7 7 0 0 1 14 0c0 4-4 7.5-7 10z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

const STEPS = [
  { title: "選擇專注時間", description: "從 1、25、50 或 90 分鐘中挑一個適合現在的節奏。" },
  { title: "專心完成倒數", description: "開始後可以暫停再繼續，完整倒數結束就算完成一回合。" },
  { title: "領取 XP 並起身活動", description: "查看獲得的經驗值與等級進度，並依提醒起身動一動。" },
];

export default function FeatureSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">為什麼是 Focus Quest</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border-subtle bg-surface p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-background text-gold">
              {feature.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-2xl font-bold text-foreground sm:text-3xl">使用方式</h2>
      <ol className="mt-8 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border-subtle bg-surface p-6"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-background">
              {index + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
