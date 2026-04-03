import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Settings {
  profile: {
    name: string;
    email: string;
    bio: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'default' | 'large';
  };
}

export interface SettingsState {
  settings: Settings | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  saveStatus: 'idle' | 'saving' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  status: 'idle',
  saveStatus: 'idle',
  error: null,
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async () => {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to load settings');
    }
    return res.json() as Promise<Settings>;
  },
);

export const updateProfile = createAsyncThunk(
  'settings/updateProfile',
  async (data: { name: string; bio: string }) => {
    const res = await fetch(`${API_URL}/settings/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message || 'Failed to update profile');
    }
    return res.json() as Promise<Settings>;
  },
);

export const updateNotifications = createAsyncThunk(
  'settings/updateNotifications',
  async (data: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    marketingEmails: boolean;
  }) => {
    const res = await fetch(`${API_URL}/settings/notifications`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message || 'Failed to update notifications');
    }
    return res.json() as Promise<Settings>;
  },
);

export const updateAppearance = createAsyncThunk(
  'settings/updateAppearance',
  async (data: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'default' | 'large';
  }) => {
    const res = await fetch(`${API_URL}/settings/appearance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message || 'Failed to update appearance');
    }
    return res.json() as Promise<Settings>;
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError(state) {
      state.error = null;
      state.saveStatus = 'idle';
    },
    resetSaveStatus(state) {
      state.saveStatus = 'idle';
    },
    optimisticUpdateNotifications(state, action) {
      if (state.settings) {
        state.settings.notifications = action.payload;
      }
    },
    optimisticUpdateAppearance(state, action) {
      if (state.settings) {
        state.settings.appearance = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSettings
      .addCase(fetchSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load settings';
      })
      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.saveStatus = 'saving';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.settings = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.error.message || 'Failed to update profile';
      })
      // updateNotifications
      .addCase(updateNotifications.pending, (state) => {
        state.saveStatus = 'saving';
      })
      .addCase(updateNotifications.fulfilled, (state, action) => {
        state.saveStatus = 'idle';
        state.settings = action.payload;
      })
      .addCase(updateNotifications.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error =
          action.error.message || 'Failed to update notifications';
      })
      // updateAppearance
      .addCase(updateAppearance.pending, (state) => {
        state.saveStatus = 'saving';
      })
      .addCase(updateAppearance.fulfilled, (state, action) => {
        state.saveStatus = 'idle';
        state.settings = action.payload;
      })
      .addCase(updateAppearance.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error =
          action.error.message || 'Failed to update appearance';
      });
  },
});

export const {
  clearSettingsError,
  resetSaveStatus,
  optimisticUpdateNotifications,
  optimisticUpdateAppearance,
} = settingsSlice.actions;
export default settingsSlice.reducer;
