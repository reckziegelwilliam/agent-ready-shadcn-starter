"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { deleteUploadedFile } from "@/features/uploads/uploadsSlice";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UploadedFilesTable() {
  const dispatch = useAppDispatch();
  const { uploadedFiles, fetchStatus, fetchError } = useAppSelector(
    (state) => state.uploads
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteUploadedFile(id)).unwrap();
        toast.success("File deleted.");
      } catch {
        toast.error("Failed to delete file.");
      }
    },
    [dispatch]
  );

  if (fetchStatus === "loading") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Previously Uploaded</h3>
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
    );
  }

  if (fetchStatus === "failed") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Previously Uploaded</h3>
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">
            {fetchError || "Failed to load uploaded files."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Previously Uploaded</h3>
      {uploadedFiles.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No files uploaded yet.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadedFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(file.id)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
