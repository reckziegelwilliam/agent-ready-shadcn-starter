import { Users } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface DataTableEmptyProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DataTableEmpty({
  message = "No users found.",
  actionLabel = "Add first user",
  onAction,
}: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Users className="size-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters.
        </p>
      </div>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
