import { Skeleton } from "@workspace/ui/components/skeleton";

export function UploadPageLoading() {
  return (
    <div className="space-y-8">
      {/* Upload zone skeleton */}
      <Skeleton className="h-40 w-full rounded-lg" />

      {/* Upload list skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="rounded-lg border">
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
