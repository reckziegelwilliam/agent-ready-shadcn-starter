import type { ComparisonExample } from "./types";

export const fileUploadComparison: ComparisonExample = {
  slug: "file-upload",
  title: "File Upload",
  description:
    "Drag-and-drop upload zone with file previews, progress tracking, and per-file retry. AI output had no drag-over visual feedback, no client-side validation, no URL cleanup, and no individual retry. The production version fixes all six issues found in review.",
  issueCount: 6,
  files: [
    {
      filename: "upload-zone.tsx",
      aiGenerated: `export function UploadZone() {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files).map((file) => ({
          id: \`file-\${Date.now()}-\${Math.random().toString(36).slice(2)}\`,
          file: { name: file.name, size: file.size, type: file.type },
        }));
        dispatch(addFiles(files));
      }
    },
    [dispatch],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files).map((file) => ({
          id: \`file-\${Date.now()}-\${Math.random().toString(36).slice(2)}\`,
          file: { name: file.name, size: file.size, type: file.type },
        }));
        dispatch(addFiles(files));
      }
    },
    [dispatch],
  );

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input ref={fileInputRef} type="file" className="hidden"
        multiple onChange={handleFileChange} />
      <Upload className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">
        Drag & drop files here or click to browse
      </p>
    </div>
  );
}`,
      production: `export function UploadZone() {
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
      const remainingSlots = MAX_FILE_COUNT - activeFileCount;
      if (remainingSlots <= 0) {
        toast.error("You can upload up to 5 files at once.");
        return;
      }
      const selected = Array.from(fileList).slice(0, remainingSlots);
      const validFiles = [];
      for (const file of selected) {
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast.error(\`\${file.name} has an unsupported file type.\`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(\`\${file.name} exceeds the 10 MB limit.\`);
          continue;
        }
        const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
        validFiles.push({
          id: \`file-\${Date.now()}-\${Math.random().toString(36).slice(2)}\`,
          file: { name: file.name, size: file.size, type: file.type },
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        });
      }
      if (validFiles.length > 0) dispatch(addFiles(validFiles));
    },
    [dispatch, activeFileCount],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isDisabled) return;
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragOver(true);
  }, [isDisabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (!isDisabled && e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    },
    [isDisabled, validateAndAddFiles],
  );

  return (
    <div
      role="button" tabIndex={isDisabled ? -1 : 0}
      aria-label="Upload files. Drag and drop or click to browse."
      aria-disabled={isDisabled}
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
        isDragOver && !isDisabled
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        isDisabled && "cursor-not-allowed opacity-50",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isDisabled && fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" className="hidden"
        multiple accept={ACCEPTED_FILE_TYPES.join(",")} onChange={handleFileChange} />
      {isDragOver
        ? <FileUp className="h-6 w-6 text-primary" />
        : <Upload className="h-6 w-6 text-muted-foreground" />}
      <p className="text-sm font-medium">
        {isDragOver ? "Drop files here" : "Drag & drop files here or click to browse"}
      </p>
    </div>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 5,
          lineEnd: 16,
          type: "fix",
          title: "No drag-over visual feedback",
          description:
            "The drop handler works but the zone appearance never changes when a file is dragged over it. There is no isDragOver state, no dragenter/dragleave handling, and no conditional styling. Users get no visual confirmation that the zone is a valid drop target.",
        },
        {
          lineStart: 8,
          lineEnd: 13,
          type: "fix",
          title: "No file type or size validation",
          description:
            "Files are added directly to the queue without checking type or size. Invalid files waste time uploading and produce confusing server errors. Client-side validation must reject files before they enter the Redux store.",
        },
        {
          lineStart: 38,
          lineEnd: 43,
          type: "fix",
          title: "No aria-label, no disabled state",
          description:
            "The drop zone div has no role, aria-label, or aria-disabled. Screen readers cannot identify it as an interactive element. There is no max file count enforcement or disabled appearance when the limit is reached.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 4,
          lineEnd: 5,
          type: "fix",
          title: "Drag-over state with counter for nested elements",
          description:
            "isDragOver state is toggled by dragenter/dragleave events. A dragCounter ref prevents flicker from nested DOM elements. The zone border changes to primary color and gains a tinted background during drag-over.",
        },
        {
          lineStart: 13,
          lineEnd: 39,
          type: "fix",
          title: "Client-side validation before queuing",
          description:
            "validateAndAddFiles checks file type against ACCEPTED_FILE_TYPES, size against MAX_FILE_SIZE (10 MB), and count against MAX_FILE_COUNT (5). Invalid files are rejected with descriptive toast errors before entering the store.",
        },
        {
          lineStart: 71,
          lineEnd: 77,
          type: "addition",
          title: "Accessible drop zone with disabled state",
          description:
            "The zone has role=button, tabIndex, aria-label, and aria-disabled. When the file count limit is reached, the zone becomes visually muted and non-interactive. Keyboard users can activate it with Enter or Space.",
        },
      ],
    },
    {
      filename: "file-preview-card.tsx",
      aiGenerated: `export function FilePreviewCard({
  file,
  onRemove,
}: { file: FileUpload; onRemove: (id: string) => void }) {
  const isImage = file.file.type.startsWith("image/");

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
        {isImage && file.previewUrl ? (
          <img src={file.previewUrl} alt={file.file.name}
            className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{file.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file.size)}
        </p>

        {file.status === "uploading" && (
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full">
            <div className="h-full bg-primary rounded-full"
              style={{ width: \`\${file.progress}%\` }} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {file.status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        {file.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
        <Button variant="ghost" size="icon" className="h-7 w-7"
          onClick={() => onRemove(file.id)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}`,
      production: `export function FilePreviewCard({
  file,
  onRemove,
  onRetry,
}: FilePreviewCardProps) {
  const previewUrlRef = useRef(file.previewUrl);

  // Clean up blob URL on unmount to prevent memory leaks
  useEffect(() => {
    const url = previewUrlRef.current;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const isImage = ACCEPTED_IMAGE_TYPES.includes(file.file.type);

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
        {isImage && file.previewUrl ? (
          <img src={file.previewUrl} alt={\`Preview of \${file.file.name}\`}
            className="h-full w-full object-cover" />
        ) : (
          <FileText className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

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

        {file.status === "uploading" && (
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full">
            <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
              style={{ width: \`\${file.progress}%\` }} />
          </div>
        )}

        {file.status === "failed" && file.error && (
          <p className="mt-1 text-xs text-destructive">{file.error}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {file.status === "complete" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        {file.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}

        {file.status === "failed" && (
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => onRetry(file.id)}
            aria-label={\`Retry upload for \${file.file.name}\`}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}

        {file.status !== "uploading" && (
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => onRemove(file.id)}
            aria-label={\`Remove \${file.file.name}\`}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 1,
          lineEnd: 4,
          type: "fix",
          title: "No onRetry prop — no individual retry",
          description:
            "The component only accepts onRemove. There is no way to retry a single failed upload. Users must remove the file and re-add it, or rely on a batch \"Retry All\" button elsewhere. Per-file retry gives users granular control.",
        },
        {
          lineStart: 5,
          lineEnd: 12,
          type: "fix",
          title: "No URL.revokeObjectURL cleanup",
          description:
            "The preview URL created via URL.createObjectURL is never revoked when the component unmounts or the file is removed. Each blob URL leaks memory. Over time, this accumulates and degrades browser performance.",
        },
        {
          lineStart: 24,
          lineEnd: 28,
          type: "fix",
          title: "Progress bar has no CSS transition",
          description:
            "The progress bar width changes abruptly with no animation. Without transition-all duration-300 ease-out, the bar jumps from one value to the next instead of animating smoothly.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 6,
          lineEnd: 14,
          type: "fix",
          title: "Blob URL cleanup on unmount",
          description:
            "A ref stores the preview URL and a useEffect cleanup function calls URL.revokeObjectURL when the component unmounts. This prevents memory leaks from accumulated blob URLs.",
        },
        {
          lineStart: 56,
          lineEnd: 63,
          type: "fix",
          title: "Per-file retry button on failed uploads",
          description:
            "Failed uploads show a retry button that dispatches uploadFile for just that file. The button has an aria-label identifying which file it retries. Users can retry specific failures without re-uploading everything.",
        },
        {
          lineStart: 41,
          lineEnd: 44,
          type: "improvement",
          title: "Smooth progress bar with CSS transition",
          description:
            "The progress bar includes transition-all duration-300 ease-out for smooth visual updates. Combined with interval-based progress simulation, the bar animates continuously instead of jumping.",
        },
      ],
    },
  ],
};
