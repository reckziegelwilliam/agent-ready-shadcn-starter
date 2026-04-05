"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addFiles,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_COUNT,
} from "@/features/uploads/uploadsSlice";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone() {
  const dispatch = useAppDispatch();
  const files = useAppSelector((state) => state.uploads.files);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFileCount = files.filter(
    (f) => f.status === "queued" || f.status === "uploading"
  ).length;
  const isDisabled = activeFileCount >= MAX_FILE_COUNT;

  const validateAndAddFiles = useCallback(
    (fileList: FileList) => {
      const currentActive = files.filter(
        (f) => f.status === "queued" || f.status === "uploading"
      ).length;
      const remainingSlots = MAX_FILE_COUNT - currentActive;

      if (remainingSlots <= 0) {
        toast.error("You can upload up to 5 files at once.");
        return;
      }

      const selectedFiles = Array.from(fileList);
      if (selectedFiles.length > remainingSlots) {
        toast.error(
          `You can upload up to 5 files at once. ${selectedFiles.length - remainingSlots} file(s) were not added.`
        );
      }

      const filesToAdd = selectedFiles.slice(0, remainingSlots);
      const validFiles: Array<{
        id: string;
        file: { name: string; size: number; type: string };
        previewUrl?: string;
      }> = [];

      for (const file of filesToAdd) {
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast.error(`${file.name} has an unsupported file type.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(
            `${file.name} exceeds the 10 MB limit (${formatFileSize(file.size)}).`
          );
          continue;
        }

        const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
        const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

        validFiles.push({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file: { name: file.name, size: file.size, type: file.type },
          previewUrl,
        });
      }

      if (validFiles.length > 0) {
        dispatch(addFiles(validFiles));
      }
    },
    [dispatch, files]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDisabled) return;
      dragCounter.current += 1;
      if (dragCounter.current === 1) {
        setIsDragOver(true);
      }
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragOver(false);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);

      if (isDisabled) {
        toast.error("You can upload up to 5 files at once.");
        return;
      }

      if (e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    },
    [isDisabled, validateAndAddFiles]
  );

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    fileInputRef.current?.click();
  }, [isDisabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndAddFiles(e.target.files);
      }
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [validateAndAddFiles]
  );

  const acceptString = ACCEPTED_FILE_TYPES.join(",");

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label="Upload files. Drag and drop files here or click to browse."
      aria-disabled={isDisabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
        isDragOver && !isDisabled
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        isDisabled && "cursor-not-allowed opacity-50"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept={acceptString}
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <div
        className={cn(
          "rounded-full bg-muted p-3 transition-transform",
          isDragOver && !isDisabled && "scale-110"
        )}
      >
        {isDragOver ? (
          <FileUp className="h-6 w-6 text-primary" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {isDragOver ? "Drop files here" : "Drag & drop files here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images (JPG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX). Max 10 MB per
          file, up to 5 files.
        </p>
      </div>
    </div>
  );
}
