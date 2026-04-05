"use client";

import { useEffect } from "react";
import { Separator } from "@workspace/ui/components/separator";
import { useAppDispatch } from "@/lib/store/hooks";
import { fetchUploadedFiles } from "@/features/uploads/uploadsSlice";
import { UploadZone } from "@/components/upload/upload-zone";
import { UploadList } from "@/components/upload/upload-list";
import { UploadedFilesTable } from "@/components/upload/uploaded-files-table";

export default function UploadPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUploadedFiles());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File Upload</h1>
        <p className="text-muted-foreground">
          Upload images and documents with drag-and-drop support.
        </p>
      </div>
      <Separator />
      <UploadZone />
      <UploadList />
      <UploadedFilesTable />
    </div>
  );
}
