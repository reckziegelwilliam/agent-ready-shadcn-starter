import type { ComparisonExample } from "./types";
import { authFlowComparison } from "./auth-flow";
import { dashboardTableComparison } from "./dashboard-table";

export type { Annotation, ComparisonFile, ComparisonExample } from "./types";

export const comparisons: ComparisonExample[] = [
  authFlowComparison,
  dashboardTableComparison,
];

export const comparisonsBySlug: Record<string, ComparisonExample> = Object.fromEntries(
  comparisons.map((c) => [c.slug, c])
);
