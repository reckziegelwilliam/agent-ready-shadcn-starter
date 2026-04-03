import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import settingsReducer from '@/features/settings/settingsSlice';
import wizardReducer from '@/features/wizard/wizardSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      settings: settingsReducer,
      wizard: wizardReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
