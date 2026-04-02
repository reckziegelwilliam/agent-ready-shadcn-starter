import { describe, it, expect } from 'vitest';
import authReducer, {
  AuthState,
  clearError,
  logout,
  loginUser,
} from '../authSlice';

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

describe('authSlice', () => {
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('clearError should reset error and status', () => {
    const stateWithError: AuthState = {
      ...initialState,
      error: 'Something went wrong',
      status: 'failed',
    };
    const result = authReducer(stateWithError, clearError());
    expect(result.error).toBeNull();
    expect(result.status).toBe('idle');
  });

  it('logout should reset the entire state', () => {
    const loggedInState: AuthState = {
      user: { id: '1', email: 'test@example.com', name: 'Test' },
      token: 'abc-123',
      status: 'succeeded',
      error: null,
    };
    const result = authReducer(loggedInState, logout());
    expect(result).toEqual(initialState);
  });

  it('loginUser.pending should set loading status and clear error', () => {
    const stateWithError: AuthState = {
      ...initialState,
      error: 'Previous error',
      status: 'failed',
    };
    const result = authReducer(stateWithError, loginUser.pending('', { email: '', password: '' }));
    expect(result.status).toBe('loading');
    expect(result.error).toBeNull();
  });

  it('loginUser.fulfilled should set user and token', () => {
    const payload = {
      user: { id: '1', email: 'demo@example.com', name: 'Demo User' },
      token: 'mock-jwt-token-1',
    };
    const result = authReducer(
      { ...initialState, status: 'loading' },
      loginUser.fulfilled(payload, '', { email: '', password: '' }),
    );
    expect(result.status).toBe('succeeded');
    expect(result.user).toEqual(payload.user);
    expect(result.token).toBe(payload.token);
  });

  it('loginUser.rejected should set error message', () => {
    const result = authReducer(
      { ...initialState, status: 'loading' },
      loginUser.rejected(new Error('Invalid credentials'), '', { email: '', password: '' }),
    );
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Invalid credentials');
  });
});
