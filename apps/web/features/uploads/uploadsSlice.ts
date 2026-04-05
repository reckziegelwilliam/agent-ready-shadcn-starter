import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_FILE_COUNT = 5;

export interface FileUpload {
  id: string;
  file: {
    name: string;
    size: number;
    type: string;
  };
  status: 'queued' | 'uploading' | 'complete' | 'failed';
  progress: number;
  error?: string;
  previewUrl?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface UploadsState {
  files: FileUpload[];
  uploadedFiles: UploadedFile[];
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  fetchError: string | null;
}

const initialState: UploadsState = {
  files: [],
  uploadedFiles: [],
  fetchStatus: 'idle',
  fetchError: null,
};

export const fetchUploadedFiles = createAsyncThunk(
  'uploads/fetchUploadedFiles',
  async () => {
    const res = await fetch(`${API_URL}/uploads`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to fetch uploaded files');
    }
    return res.json() as Promise<UploadedFile[]>;
  },
);

export const uploadFile = createAsyncThunk(
  'uploads/uploadFile',
  async (fileId: string, { getState, dispatch }) => {
    const state = getState() as { uploads: UploadsState };
    const fileUpload = state.uploads.files.find((f) => f.id === fileId);
    if (!fileUpload) {
      throw new Error('File not found in queue');
    }

    // Simulate progress updates
    const progressPromise = new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 90) {
          progress = 90;
          clearInterval(interval);
          resolve();
        }
        dispatch(updateFileProgress({ id: fileId, progress: Math.min(progress, 90) }));
      }, 200);
    });

    // Start progress simulation
    progressPromise.catch(() => {
      // Progress simulation is fire-and-forget
    });

    const res = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fileUpload.file.name,
        size: fileUpload.file.size,
        type: fileUpload.file.type,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Upload failed. Please try again.');
    }

    const uploaded = (await res.json()) as UploadedFile;
    return { fileId, uploaded };
  },
);

export const deleteUploadedFile = createAsyncThunk(
  'uploads/deleteUploadedFile',
  async (id: string) => {
    const res = await fetch(`${API_URL}/uploads/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to delete file');
    }
    return id;
  },
);

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    addFiles(
      state,
      action: PayloadAction<
        Array<{
          id: string;
          file: { name: string; size: number; type: string };
          previewUrl?: string;
        }>
      >,
    ) {
      const newFiles: FileUpload[] = action.payload.map((f) => ({
        id: f.id,
        file: f.file,
        status: 'queued' as const,
        progress: 0,
        previewUrl: f.previewUrl,
      }));
      state.files.push(...newFiles);
    },
    removeFile(state, action: PayloadAction<string>) {
      state.files = state.files.filter((f) => f.id !== action.payload);
    },
    clearCompleted(state) {
      state.files = state.files.filter((f) => f.status !== 'complete');
    },
    resetAll(state) {
      state.files = [];
    },
    updateFileProgress(
      state,
      action: PayloadAction<{ id: string; progress: number }>,
    ) {
      const file = state.files.find((f) => f.id === action.payload.id);
      if (file) {
        file.progress = Math.round(action.payload.progress);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUploadedFiles
      .addCase(fetchUploadedFiles.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchUploadedFiles.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.uploadedFiles = action.payload;
      })
      .addCase(fetchUploadedFiles.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError =
          action.error.message || 'Failed to fetch uploaded files';
      })
      // uploadFile
      .addCase(uploadFile.pending, (state, action) => {
        const file = state.files.find((f) => f.id === action.meta.arg);
        if (file) {
          file.status = 'uploading';
          file.progress = 0;
          file.error = undefined;
        }
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        const file = state.files.find(
          (f) => f.id === action.payload.fileId,
        );
        if (file) {
          file.status = 'complete';
          file.progress = 100;
        }
        // Add to uploaded files list
        state.uploadedFiles.unshift(action.payload.uploaded);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        const file = state.files.find((f) => f.id === action.meta.arg);
        if (file) {
          file.status = 'failed';
          file.progress = 0;
          file.error =
            action.error.message || 'Upload failed. Please try again.';
        }
      })
      // deleteUploadedFile
      .addCase(deleteUploadedFile.fulfilled, (state, action) => {
        state.uploadedFiles = state.uploadedFiles.filter(
          (f) => f.id !== action.payload,
        );
      });
  },
});

export const {
  addFiles,
  removeFile,
  clearCompleted,
  resetAll,
  updateFileProgress,
} = uploadsSlice.actions;
export default uploadsSlice.reducer;
