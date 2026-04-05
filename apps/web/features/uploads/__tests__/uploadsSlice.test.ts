import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import uploadsReducer, {
  addFiles,
  removeFile,
  clearCompleted,
  resetAll,
  updateFileProgress,
  uploadFile,
  fetchUploadedFiles,
  deleteUploadedFile,
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_COUNT,
  type UploadsState,
  type FileUpload,
} from '../uploadsSlice';

function createTestStore(preloadedState?: Partial<UploadsState>) {
  return configureStore({
    reducer: { uploads: uploadsReducer },
    preloadedState: preloadedState
      ? { uploads: { ...initialState, ...preloadedState } }
      : undefined,
  });
}

const initialState: UploadsState = {
  files: [],
  uploadedFiles: [],
  fetchStatus: 'idle',
  fetchError: null,
};

describe('uploadsSlice', () => {
  describe('initial state', () => {
    it('should return the initial state', () => {
      const store = createTestStore();
      expect(store.getState().uploads).toEqual(initialState);
    });
  });

  describe('addFiles', () => {
    it('should add files to the queue with queued status', () => {
      const store = createTestStore();
      const filesToAdd = [
        {
          id: 'file-1',
          file: { name: 'test.jpg', size: 1024, type: 'image/jpeg' },
          previewUrl: 'blob:http://localhost/123',
        },
        {
          id: 'file-2',
          file: { name: 'doc.pdf', size: 2048, type: 'application/pdf' },
        },
      ];

      store.dispatch(addFiles(filesToAdd));
      const state = store.getState().uploads;

      expect(state.files).toHaveLength(2);
      expect(state.files[0]).toEqual({
        id: 'file-1',
        file: { name: 'test.jpg', size: 1024, type: 'image/jpeg' },
        status: 'queued',
        progress: 0,
        previewUrl: 'blob:http://localhost/123',
      });
      expect(state.files[1]).toEqual({
        id: 'file-2',
        file: { name: 'doc.pdf', size: 2048, type: 'application/pdf' },
        status: 'queued',
        progress: 0,
        previewUrl: undefined,
      });
    });

    it('should append to existing files', () => {
      const store = createTestStore({
        files: [
          {
            id: 'existing',
            file: { name: 'old.jpg', size: 512, type: 'image/jpeg' },
            status: 'complete',
            progress: 100,
          },
        ],
      });

      store.dispatch(
        addFiles([
          {
            id: 'new-1',
            file: { name: 'new.pdf', size: 1024, type: 'application/pdf' },
          },
        ]),
      );

      expect(store.getState().uploads.files).toHaveLength(2);
    });
  });

  describe('removeFile', () => {
    it('should remove a file by id', () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'test.jpg', size: 1024, type: 'image/jpeg' },
            status: 'queued',
            progress: 0,
          },
          {
            id: 'file-2',
            file: { name: 'doc.pdf', size: 2048, type: 'application/pdf' },
            status: 'queued',
            progress: 0,
          },
        ],
      });

      store.dispatch(removeFile('file-1'));
      const state = store.getState().uploads;

      expect(state.files).toHaveLength(1);
      expect(state.files[0]?.id).toBe('file-2');
    });

    it('should handle removing a non-existent file gracefully', () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'test.jpg', size: 1024, type: 'image/jpeg' },
            status: 'queued',
            progress: 0,
          },
        ],
      });

      store.dispatch(removeFile('non-existent'));
      expect(store.getState().uploads.files).toHaveLength(1);
    });
  });

  describe('clearCompleted', () => {
    it('should remove only completed files', () => {
      const store = createTestStore({
        files: [
          {
            id: 'queued',
            file: { name: 'a.jpg', size: 1024, type: 'image/jpeg' },
            status: 'queued',
            progress: 0,
          },
          {
            id: 'complete',
            file: { name: 'b.jpg', size: 1024, type: 'image/jpeg' },
            status: 'complete',
            progress: 100,
          },
          {
            id: 'failed',
            file: { name: 'c.jpg', size: 1024, type: 'image/jpeg' },
            status: 'failed',
            progress: 0,
            error: 'Upload failed.',
          },
        ],
      });

      store.dispatch(clearCompleted());
      const state = store.getState().uploads;

      expect(state.files).toHaveLength(2);
      expect(state.files.map((f) => f.id)).toEqual(['queued', 'failed']);
    });
  });

  describe('resetAll', () => {
    it('should clear all files from queue', () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'a.jpg', size: 1024, type: 'image/jpeg' },
            status: 'complete',
            progress: 100,
          },
        ],
      });

      store.dispatch(resetAll());
      expect(store.getState().uploads.files).toHaveLength(0);
    });
  });

  describe('updateFileProgress', () => {
    it('should update progress for a specific file', () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'a.jpg', size: 1024, type: 'image/jpeg' },
            status: 'uploading',
            progress: 0,
          },
        ],
      });

      store.dispatch(updateFileProgress({ id: 'file-1', progress: 45.7 }));
      expect(store.getState().uploads.files[0]?.progress).toBe(46);
    });
  });

  describe('uploadFile thunk', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set status to uploading on pending', () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'a.jpg', size: 1024, type: 'image/jpeg' },
            status: 'queued',
            progress: 0,
          },
        ],
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}), // never resolves
      );

      store.dispatch(uploadFile('file-1'));

      // After dispatch, the pending action should have fired
      const state = store.getState().uploads;
      expect(state.files[0]?.status).toBe('uploading');
      expect(state.files[0]?.progress).toBe(0);
    });

    it('should set status to complete on fulfilled', async () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'a.jpg', size: 1024, type: 'image/jpeg' },
            status: 'queued',
            progress: 0,
          },
        ],
      });

      const mockResponse = {
        id: 'upload-123',
        name: 'a.jpg',
        size: 1024,
        type: 'image/jpeg',
        uploadedAt: '2025-12-15T10:00:00Z',
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await store.dispatch(uploadFile('file-1'));
      const state = store.getState().uploads;

      expect(state.files[0]?.status).toBe('complete');
      expect(state.files[0]?.progress).toBe(100);
      expect(state.uploadedFiles[0]).toEqual(mockResponse);
    });

    it('should set status to failed on rejected', async () => {
      const store = createTestStore({
        files: [
          {
            id: 'file-1',
            file: { name: 'a.jpg', size: 1024, type: 'image/jpeg' },
            status: 'queued',
            progress: 0,
          },
        ],
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Upload failed. Please try again.' }),
      });

      await store.dispatch(uploadFile('file-1'));
      const state = store.getState().uploads;

      expect(state.files[0]?.status).toBe('failed');
      expect(state.files[0]?.error).toBe('Upload failed. Please try again.');
    });
  });

  describe('fetchUploadedFiles thunk', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set fetchStatus to loading on pending', () => {
      const store = createTestStore();

      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {}),
      );

      store.dispatch(fetchUploadedFiles());
      expect(store.getState().uploads.fetchStatus).toBe('loading');
    });

    it('should populate uploadedFiles on fulfilled', async () => {
      const store = createTestStore();
      const mockFiles = [
        {
          id: 'demo-1',
          name: 'test.pdf',
          size: 2048,
          type: 'application/pdf',
          uploadedAt: '2025-12-15T10:00:00Z',
        },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFiles,
      });

      await store.dispatch(fetchUploadedFiles());
      const state = store.getState().uploads;

      expect(state.fetchStatus).toBe('succeeded');
      expect(state.uploadedFiles).toEqual(mockFiles);
    });

    it('should set fetchError on rejected', async () => {
      const store = createTestStore();

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      await store.dispatch(fetchUploadedFiles());
      const state = store.getState().uploads;

      expect(state.fetchStatus).toBe('failed');
      expect(state.fetchError).toBe('Server error');
    });
  });

  describe('file validation constants', () => {
    it('should have correct accepted file types', () => {
      expect(ACCEPTED_FILE_TYPES).toContain('image/jpeg');
      expect(ACCEPTED_FILE_TYPES).toContain('image/png');
      expect(ACCEPTED_FILE_TYPES).toContain('image/gif');
      expect(ACCEPTED_FILE_TYPES).toContain('image/webp');
      expect(ACCEPTED_FILE_TYPES).toContain('application/pdf');
      expect(ACCEPTED_FILE_TYPES).toContain('application/msword');
      expect(ACCEPTED_FILE_TYPES).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
    });

    it('should have 10 MB max file size', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should have 5 max file count', () => {
      expect(MAX_FILE_COUNT).toBe(5);
    });
  });
});
