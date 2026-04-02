import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import authReducer, { AuthState } from '@/features/auth/authSlice';
import { LoginForm } from '../login-form';

// Mock next/link since we're not in a Next.js environment
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function createTestStore(preloadedAuth?: Partial<AuthState>) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        status: 'idle' as const,
        error: null,
        ...preloadedAuth,
      },
    },
  });
}

function renderWithStore(
  ui: React.ReactElement,
  preloadedAuth?: Partial<AuthState>,
) {
  const store = createTestStore(preloadedAuth);
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

describe('LoginForm', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders email and password fields', () => {
    renderWithStore(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the sign in button', () => {
    renderWithStore(<LoginForm />);
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it('shows validation error for invalid email on blur', async () => {
    const user = userEvent.setup();
    renderWithStore(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'not-an-email');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email address/i),
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for short password on blur', async () => {
    const user = userEvent.setup();
    renderWithStore(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'short');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state when dispatch sets status to loading', async () => {
    // The useEffect dispatches clearError on mount, so we set loading AFTER mount
    const store = createTestStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    // Manually dispatch the pending action to simulate loading
    store.dispatch({ type: 'auth/login/pending' });

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('displays server error from auth state', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>,
    );

    // Dispatch a rejected action after mount (clearError already ran)
    store.dispatch({
      type: 'auth/login/rejected',
      error: { message: 'Invalid email or password' },
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Invalid email or password',
      );
    });
  });
});
