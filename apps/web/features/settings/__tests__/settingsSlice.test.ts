import { describe, it, expect } from 'vitest';
import settingsReducer, {
  SettingsState,
  Settings,
  clearSettingsError,
  resetSaveStatus,
  optimisticUpdateNotifications,
  optimisticUpdateAppearance,
  fetchSettings,
  updateProfile,
  updateNotifications,
  updateAppearance,
} from '../settingsSlice';

const mockSettings: Settings = {
  profile: {
    name: 'Demo User',
    email: 'demo@example.com',
    bio: 'A developer.',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
  },
  appearance: {
    theme: 'system',
    fontSize: 'default',
  },
};

const initialState: SettingsState = {
  settings: null,
  status: 'idle',
  saveStatus: 'idle',
  error: null,
};

const loadedState: SettingsState = {
  settings: mockSettings,
  status: 'succeeded',
  saveStatus: 'idle',
  error: null,
};

describe('settingsSlice', () => {
  it('should return the initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  it('clearSettingsError should reset error and saveStatus', () => {
    const stateWithError: SettingsState = {
      ...loadedState,
      error: 'Something went wrong',
      saveStatus: 'failed',
    };
    const result = settingsReducer(stateWithError, clearSettingsError());
    expect(result.error).toBeNull();
    expect(result.saveStatus).toBe('idle');
  });

  it('resetSaveStatus should set saveStatus to idle', () => {
    const state: SettingsState = {
      ...loadedState,
      saveStatus: 'succeeded',
    };
    const result = settingsReducer(state, resetSaveStatus());
    expect(result.saveStatus).toBe('idle');
  });

  it('optimisticUpdateNotifications should update notifications in state', () => {
    const newNotifications = {
      emailNotifications: false,
      pushNotifications: true,
      marketingEmails: true,
    };
    const result = settingsReducer(
      loadedState,
      optimisticUpdateNotifications(newNotifications)
    );
    expect(result.settings?.notifications).toEqual(newNotifications);
  });

  it('optimisticUpdateAppearance should update appearance in state', () => {
    const newAppearance = { theme: 'dark' as const, fontSize: 'large' as const };
    const result = settingsReducer(
      loadedState,
      optimisticUpdateAppearance(newAppearance)
    );
    expect(result.settings?.appearance).toEqual(newAppearance);
  });

  // fetchSettings
  it('fetchSettings.pending should set loading status and clear error', () => {
    const stateWithError: SettingsState = {
      ...initialState,
      error: 'Previous error',
      status: 'failed',
    };
    const result = settingsReducer(
      stateWithError,
      fetchSettings.pending('')
    );
    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('fetchSettings.fulfilled should set settings and succeeded status', () => {
    const result = settingsReducer(
      { ...initialState, status: 'loading' },
      fetchSettings.fulfilled(mockSettings, '')
    );
    expect(result.status).toBe('succeeded');
    expect(result.settings).toEqual(mockSettings);
  });

  it('fetchSettings.rejected should set error and failed status', () => {
    const result = settingsReducer(
      { ...initialState, status: 'loading' },
      fetchSettings.rejected(new Error('Network error'), '')
    );
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Network error');
  });

  // updateProfile
  it('updateProfile.pending should set saveStatus to saving', () => {
    const result = settingsReducer(
      loadedState,
      updateProfile.pending('', { name: 'New', bio: '' })
    );
    expect(result.saveStatus).toBe('saving');
    expect(result.error).toBeNull();
  });

  it('updateProfile.fulfilled should update settings and set saveStatus to succeeded', () => {
    const updatedSettings = {
      ...mockSettings,
      profile: { ...mockSettings.profile, name: 'Updated Name' },
    };
    const result = settingsReducer(
      { ...loadedState, saveStatus: 'saving' },
      updateProfile.fulfilled(updatedSettings, '', {
        name: 'Updated Name',
        bio: '',
      })
    );
    expect(result.saveStatus).toBe('succeeded');
    expect(result.settings?.profile.name).toBe('Updated Name');
  });

  it('updateProfile.rejected should set error and saveStatus to failed', () => {
    const result = settingsReducer(
      { ...loadedState, saveStatus: 'saving' },
      updateProfile.rejected(new Error('Server error'), '', {
        name: 'X',
        bio: '',
      })
    );
    expect(result.saveStatus).toBe('failed');
    expect(result.error).toBe('Server error');
  });

  // updateNotifications
  it('updateNotifications.pending should set saveStatus to saving', () => {
    const result = settingsReducer(
      loadedState,
      updateNotifications.pending('', mockSettings.notifications)
    );
    expect(result.saveStatus).toBe('saving');
  });

  it('updateNotifications.fulfilled should update settings', () => {
    const updatedSettings = {
      ...mockSettings,
      notifications: {
        emailNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
      },
    };
    const result = settingsReducer(
      { ...loadedState, saveStatus: 'saving' },
      updateNotifications.fulfilled(
        updatedSettings,
        '',
        updatedSettings.notifications
      )
    );
    expect(result.saveStatus).toBe('idle');
    expect(result.settings?.notifications.pushNotifications).toBe(true);
  });

  it('updateNotifications.rejected should set error', () => {
    const result = settingsReducer(
      { ...loadedState, saveStatus: 'saving' },
      updateNotifications.rejected(
        new Error('Failed'),
        '',
        mockSettings.notifications
      )
    );
    expect(result.saveStatus).toBe('failed');
    expect(result.error).toBe('Failed');
  });

  // updateAppearance
  it('updateAppearance.pending should set saveStatus to saving', () => {
    const result = settingsReducer(
      loadedState,
      updateAppearance.pending('', mockSettings.appearance)
    );
    expect(result.saveStatus).toBe('saving');
  });

  it('updateAppearance.fulfilled should update settings', () => {
    const updatedSettings = {
      ...mockSettings,
      appearance: { theme: 'dark' as const, fontSize: 'large' as const },
    };
    const result = settingsReducer(
      { ...loadedState, saveStatus: 'saving' },
      updateAppearance.fulfilled(
        updatedSettings,
        '',
        updatedSettings.appearance
      )
    );
    expect(result.saveStatus).toBe('idle');
    expect(result.settings?.appearance.theme).toBe('dark');
  });

  it('updateAppearance.rejected should set error', () => {
    const result = settingsReducer(
      { ...loadedState, saveStatus: 'saving' },
      updateAppearance.rejected(
        new Error('Failed'),
        '',
        mockSettings.appearance
      )
    );
    expect(result.saveStatus).toBe('failed');
    expect(result.error).toBe('Failed');
  });
});
