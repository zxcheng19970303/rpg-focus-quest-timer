import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-16 pb-20 sm:px-10 lg:flex-row lg:items-center lg:gap-16 lg:pt-24">
      <div className="flex flex-col items-start gap-6 text-left lg:w-1/2">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-1.5 text-sm font-medium text-gold">
          Focus Quest ｜ 專注遠征隊
        </span>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          專注一段時間，
          <br />
          就能累積經驗、慢慢升級。
        </h1>

        <p className="max-w-md text-base leading-7 text-muted sm:text-lg">
          Focus Quest
          是一款安靜的番茄鐘小工具：陪你完成一段專注、幫你把時間換算成經驗值，也會在回合結束時提醒你起身走動、伸展或喝水。
        </p>

        <a
          href="#focus-timer"
          className="inline-flex h-12 items-center justify-center rounded-full bg-coral px-8 text-base font-semibold text-background shadow-lg shadow-coral/20 transition-colors hover:bg-coral-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          開始一段專注
        </a>
      </div>

      <div className="flex w-full justify-center lg:w-1/2">
        <Image
          src="/images/focus-quest-hero.svg"
          alt="一位專注冒險者的書桌，桌上放著番茄鐘與經驗值徽章"
          width={480}
          height={360}
          priority
          className="w-full max-w-md drop-shadow-2xl"
        />
      </div>
    </section>
  );
}
