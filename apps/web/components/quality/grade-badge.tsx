import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import type { Grade } from "@/lib/quality-data";

interface GradeBadgeProps {
  grade: Grade;
}

const gradeClassMap: Record<Grade, string> = {
  A: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  B: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  C: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  D: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

export function GradeBadge({ grade }: GradeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-2xl font-bold px-4 py-1", gradeClassMap[grade])}
    >
      {grade}
    </Badge>
  );
}
