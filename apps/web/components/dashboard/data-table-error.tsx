"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

interface DataTableErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function DataTableError({
  message = "Something went wrong while loading data.",
  onRetry,
}: DataTableErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-destructive">Failed to load data</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
