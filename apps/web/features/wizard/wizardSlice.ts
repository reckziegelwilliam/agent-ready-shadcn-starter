import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Preferences {
  industry: string;
  companySize: string;
  referralSource: string;
}

export type Plan = 'free' | 'pro' | 'enterprise';

export interface WizardState {
  currentStep: number;
  steps: {
    personal: PersonalInfo;
    preferences: Preferences;
    plan: Plan | null;
  };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const initialState: WizardState = {
  currentStep: 1,
  steps: {
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    preferences: {
      industry: '',
      companySize: '',
      referralSource: '',
    },
    plan: null,
  },
  status: 'idle',
  error: null,
};

export const submitWizard = createAsyncThunk(
  'wizard/submit',
  async (data: {
    personal: PersonalInfo;
    preferences: Preferences;
    plan: Plan;
  }) => {
    const res = await fetch(`${API_URL}/onboarding/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.message || 'Submission failed');
    }
    return res.json();
  },
);

const wizardSlice = createSlice({
  name: 'wizard',
  initialState,
  reducers: {
    setPersonalInfo(state, action: PayloadAction<PersonalInfo>) {
      state.steps.personal = action.payload;
    },
    setPreferences(state, action: PayloadAction<Preferences>) {
      state.steps.preferences = action.payload;
    },
    setPlan(state, action: PayloadAction<Plan>) {
      state.steps.plan = action.payload;
    },
    nextStep(state) {
      if (state.currentStep < 4) {
        state.currentStep += 1;
      }
    },
    prevStep(state) {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    goToStep(state, action: PayloadAction<number>) {
      if (action.payload >= 1 && action.payload <= 4) {
        state.currentStep = action.payload;
      }
    },
    resetWizard() {
      return initialState;
    },
    clearWizardError(state) {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitWizard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitWizard.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(submitWizard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Submission failed';
      });
  },
});

export const {
  setPersonalInfo,
  setPreferences,
  setPlan,
  nextStep,
  prevStep,
  goToStep,
  resetWizard,
  clearWizardError,
} = wizardSlice.actions;

export default wizardSlice.reducer;
