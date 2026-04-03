import { qualityData } from "@/lib/quality-data";
import { ExampleQualityCard } from "@/components/quality/example-quality-card";

export default function QualityPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Quality Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every example is evaluated against production criteria. Scores are
          derived from review checklists, state matrices, and test results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {qualityData.map((example) => (
          <ExampleQualityCard key={example.slug} example={example} />
        ))}
      </div>
    </div>
  );
}
