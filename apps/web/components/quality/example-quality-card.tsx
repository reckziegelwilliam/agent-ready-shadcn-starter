import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import type { ExampleQuality } from "@/lib/quality-data";
import { GradeBadge } from "./grade-badge";
import { ScoreBar } from "./score-bar";
import { StateMatrix } from "./state-matrix";
import { CategoryDetail } from "./category-detail";

interface ExampleQualityCardProps {
  example: ExampleQuality;
}

export function ExampleQualityCard({ example }: ExampleQualityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{example.title}</CardTitle>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {example.route}
            </p>
          </div>
          <GradeBadge grade={example.grade} />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Badge variant="secondary">
            {example.testCount} tests
          </Badge>
          <Badge
            variant="outline"
            className={
              example.reproducible
                ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                : "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400"
            }
          >
            {example.reproducible ? "Reproducible" : "Not reproducible"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Score Breakdown
          </h3>
          <div className="grid gap-3">
            {example.categories.map((cat) => (
              <ScoreBar
                key={cat.name}
                label={cat.name}
                passed={cat.passed}
                total={cat.total}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            State Coverage
          </h3>
          <StateMatrix states={example.stateMatrix} />
        </div>

        <Separator />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Category Details
          </h3>
          <div className="grid gap-2">
            {example.categories.map((cat) => (
              <CategoryDetail key={cat.name} category={cat} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
