"use client";

import { useEffect, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import type { FileUpload } from "@/features/uploads/uploadsSlice";
import { ACCEPTED_IMAGE_TYPES } from "@/features/uploads/uploadsSlice";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(type: string): string {
  if (type.startsWith("image/")) return type.split("/")[1]?.toUpperCase() ?? "IMAGE";
  if (type === "application/pdf") return "PDF";
  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "DOC";
  return "FILE";
}

interface FilePreviewCardProps {
  file: FileUpload;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export function FilePreviewCard({
  file,
  onRemove,
  onRetry,
}: FilePreviewCardProps) {
  const previewUrlRef = useRef(file.previewUrl);

  // Clean up preview URL on unmount
  useEffect(() => {
    const url = previewUrlRef.current;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const isImage = ACCEPTED_IMAGE_TYPES.includes(file.file.type);

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      {/* Thumbnail / Icon */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {isImage && file.previewUrl ? (
          <img
            src={file.previewUrl}
            alt={`Preview of ${file.file.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{file.file.name}</p>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {getFileTypeLabel(file.file.type)}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>

        {/* Progress bar */}
        {file.status === "uploading" && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${file.progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {file.progress}%
            </p>
          </div>
        )}

        {/* Error message */}
        {file.status === "failed" && file.error && (
          <p className="mt-1 text-xs text-destructive">{file.error}</p>
        )}
      </div>

      {/* Status + Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {file.status === "queued" && (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
        {file.status === "complete" && (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
        {file.status === "failed" && (
          <XCircle className="h-4 w-4 text-destructive" />
        )}

        {file.status === "failed" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRetry(file.id)}
            aria-label={`Retry upload for ${file.file.name}`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}

        {file.status !== "uploading" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onRemove(file.id)}
            aria-label={`Remove ${file.file.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
