"use client";

import { useCallback } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  removeFile,
  clearCompleted,
  uploadFile,
} from "@/features/uploads/uploadsSlice";
import { FilePreviewCard } from "./file-preview-card";

export function UploadList() {
  const dispatch = useAppDispatch();
  const files = useAppSelector((state) => state.uploads.files);

  const hasQueued = files.some((f) => f.status === "queued");
  const hasCompleted = files.some((f) => f.status === "complete");
  const hasUploading = files.some((f) => f.status === "uploading");

  const handleUploadAll = useCallback(() => {
    const queuedFiles = files.filter((f) => f.status === "queued");
    for (const file of queuedFiles) {
      dispatch(uploadFile(file.id));
    }
  }, [dispatch, files]);

  const handleRemove = useCallback(
    (id: string) => {
      dispatch(removeFile(id));
    },
    [dispatch]
  );

  const handleRetry = useCallback(
    (id: string) => {
      dispatch(uploadFile(id));
    },
    [dispatch]
  );

  const handleClearCompleted = useCallback(() => {
    dispatch(clearCompleted());
  }, [dispatch]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Files ({files.length})
        </h3>
        <div className="flex gap-2">
          {hasCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear Completed
            </Button>
          )}
          {hasQueued && (
            <Button
              size="sm"
              onClick={handleUploadAll}
              disabled={hasUploading}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload All
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <FilePreviewCard
            key={file.id}
            file={file}
            onRemove={handleRemove}
            onRetry={handleRetry}
          />
        ))}
      </div>
    </div>
  );
}
