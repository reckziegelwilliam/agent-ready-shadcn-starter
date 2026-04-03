import { cn } from "@workspace/ui/lib/utils";
import {
  Loader2,
  Inbox,
  AlertCircle,
  CheckCircle,
  FormInput,
  Server,
  Wifi,
  ShieldX,
} from "lucide-react";
import type { StateMatrix as StateMatrixType } from "@/lib/quality-data";

interface StateMatrixProps {
  states: StateMatrixType;
}

const stateEntries: {
  key: keyof StateMatrixType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "loading", label: "Loading", icon: Loader2 },
  { key: "empty", label: "Empty", icon: Inbox },
  { key: "error", label: "Error", icon: AlertCircle },
  { key: "success", label: "Success", icon: CheckCircle },
  { key: "validationFailure", label: "Validation", icon: FormInput },
  { key: "serverFailure", label: "Server Failure", icon: Server },
  { key: "networkError", label: "Network Error", icon: Wifi },
  { key: "permissionDenied", label: "Permission", icon: ShieldX },
];

export function StateMatrix({ states }: StateMatrixProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stateEntries.map(({ key, label, icon: Icon }) => {
        const covered = states[key];
        return (
          <div
            key={key}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-xs",
              covered
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "border-border bg-muted/30 text-muted-foreground"
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            <span>{label}</span>
            {covered ? (
              <CheckCircle className="ml-auto size-3.5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="ml-auto size-3.5 text-muted-foreground/50" />
            )}
          </div>
        );
      })}
    </div>
  );
}
