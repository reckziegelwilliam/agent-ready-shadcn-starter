import { describe, it, expect } from 'vitest';
import wizardReducer, {
  WizardState,
  initialState,
  setPersonalInfo,
  setPreferences,
  setPlan,
  nextStep,
  prevStep,
  goToStep,
  resetWizard,
  clearWizardError,
  submitWizard,
} from '../wizardSlice';

describe('wizardSlice', () => {
  it('should return the initial state', () => {
    expect(wizardReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should start on step 1', () => {
    const state = wizardReducer(undefined, { type: 'unknown' });
    expect(state.currentStep).toBe(1);
  });

  describe('nextStep', () => {
    it('should increment currentStep', () => {
      const state = wizardReducer(initialState, nextStep());
      expect(state.currentStep).toBe(2);
    });

    it('should not go beyond step 4', () => {
      let state: WizardState = { ...initialState, currentStep: 4 };
      state = wizardReducer(state, nextStep());
      expect(state.currentStep).toBe(4);
    });
  });

  describe('prevStep', () => {
    it('should decrement currentStep', () => {
      const state = wizardReducer(
        { ...initialState, currentStep: 3 },
        prevStep()
      );
      expect(state.currentStep).toBe(2);
    });

    it('should not go below step 1', () => {
      const state = wizardReducer(initialState, prevStep());
      expect(state.currentStep).toBe(1);
    });
  });

  describe('goToStep', () => {
    it('should set currentStep to the given value', () => {
      const state = wizardReducer(initialState, goToStep(3));
      expect(state.currentStep).toBe(3);
    });

    it('should not set step below 1', () => {
      const state = wizardReducer(initialState, goToStep(0));
      expect(state.currentStep).toBe(1);
    });

    it('should not set step above 4', () => {
      const state = wizardReducer(initialState, goToStep(5));
      expect(state.currentStep).toBe(1);
    });
  });

  describe('setPersonalInfo', () => {
    it('should update personal info in steps', () => {
      const personal = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '5551234567',
      };
      const state = wizardReducer(initialState, setPersonalInfo(personal));
      expect(state.steps.personal).toEqual(personal);
    });
  });

  describe('setPreferences', () => {
    it('should update preferences in steps', () => {
      const preferences = {
        industry: 'Technology',
        companySize: '11-50',
        referralSource: 'Search Engine',
      };
      const state = wizardReducer(initialState, setPreferences(preferences));
      expect(state.steps.preferences).toEqual(preferences);
    });
  });

  describe('setPlan', () => {
    it('should update plan in steps', () => {
      const state = wizardReducer(initialState, setPlan('pro'));
      expect(state.steps.plan).toBe('pro');
    });
  });

  describe('resetWizard', () => {
    it('should reset to initial state', () => {
      const modified: WizardState = {
        currentStep: 3,
        steps: {
          personal: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '',
          },
          preferences: {
            industry: 'Technology',
            companySize: '11-50',
            referralSource: 'Search Engine',
          },
          plan: 'pro',
        },
        status: 'succeeded',
        error: null,
      };
      const state = wizardReducer(modified, resetWizard());
      expect(state).toEqual(initialState);
    });
  });

  describe('clearWizardError', () => {
    it('should clear error and reset status to idle', () => {
      const stateWithError: WizardState = {
        ...initialState,
        error: 'Something failed',
        status: 'failed',
      };
      const state = wizardReducer(stateWithError, clearWizardError());
      expect(state.error).toBeNull();
      expect(state.status).toBe('idle');
    });
  });

  describe('submitWizard async thunk', () => {
    const submitPayload = {
      personal: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '',
      },
      preferences: {
        industry: 'Technology',
        companySize: '11-50',
        referralSource: 'Search Engine',
      },
      plan: 'pro' as const,
    };

    it('should set loading status on pending', () => {
      const state = wizardReducer(
        initialState,
        submitWizard.pending('', submitPayload)
      );
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should set succeeded status on fulfilled', () => {
      const state = wizardReducer(
        { ...initialState, status: 'loading' },
        submitWizard.fulfilled(
          { message: 'OK', onboardingId: 'onb_123' },
          '',
          submitPayload
        )
      );
      expect(state.status).toBe('succeeded');
    });

    it('should set failed status and error on rejected', () => {
      const state = wizardReducer(
        { ...initialState, status: 'loading' },
        submitWizard.rejected(
          new Error('Submission failed'),
          '',
          submitPayload
        )
      );
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Submission failed');
    });

    it('should clear previous error on pending', () => {
      const stateWithError: WizardState = {
        ...initialState,
        status: 'failed',
        error: 'Previous error',
      };
      const state = wizardReducer(
        stateWithError,
        submitWizard.pending('', submitPayload)
      );
      expect(state.error).toBeNull();
      expect(state.status).toBe('loading');
    });
  });
});
