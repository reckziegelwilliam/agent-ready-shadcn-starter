import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { PillarsSection } from "@/components/landing/pillars-section";
import { CompareTeaser } from "@/components/landing/compare-teaser";
import { QualityTeaser } from "@/components/landing/quality-teaser";
import { ExamplesSection } from "@/components/landing/examples-section";
import { Footer } from "@/components/landing/footer";

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <HeroSection />
      <ProblemSection />
      <PillarsSection />
      <CompareTeaser />
      <QualityTeaser />
      <ExamplesSection />
      <Footer />
    </main>
  );
}
