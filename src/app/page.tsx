import HeroSection from "@/components/HeroSection";
import FocusQuestApp from "@/components/FocusQuestApp";
import FeatureSection from "@/components/FeatureSection";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <FocusQuestApp />
      <FeatureSection />
    </main>
  );
}
