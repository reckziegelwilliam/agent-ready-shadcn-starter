import { cn } from "@workspace/ui/lib/utils";

interface ScoreBarProps {
  label: string;
  passed: number;
  total: number;
}

export function ScoreBar({ label, passed, total }: ScoreBarProps) {
  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  const barColor =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 60
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">
          {passed}/{total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
