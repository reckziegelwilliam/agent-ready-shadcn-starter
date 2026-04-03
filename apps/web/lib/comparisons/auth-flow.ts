import type { ComparisonExample } from "./types";

export const authFlowComparison: ComparisonExample = {
  slug: "auth-flow",
  title: "Auth Flow",
  description:
    "Login and forgot-password forms. AI output missed error state resets, hardcoded messages, and accessibility attributes. The production version fixes all six issues found in review.",
  issueCount: 6,
  files: [
    {
      filename: "login-form.tsx",
      aiGenerated: `export function LoginForm() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  function onSubmit(data: LoginValues) {
    dispatch(loginUser(data));
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {status === "failed" && (
        <div role="alert" className="text-sm text-destructive">
          Login failed. Please try again.
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}`,
      production: `export function LoginForm() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  function onSubmit(data: LoginValues) {
    dispatch(loginUser(data));
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      {error && (
        <div role="alert" className="text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 1,
          lineEnd: 3,
          type: "fix",
          title: "No error state reset on mount",
          description:
            "Navigating from /signup back to /login keeps a stale error banner because the Redux error state is never cleared. The AI did not add a useEffect to dispatch clearError().",
        },
        {
          lineStart: 24,
          lineEnd: 27,
          type: "fix",
          title: "Hardcoded error message",
          description:
            'The AI used a static "Login failed. Please try again." string instead of rendering the actual error from the API response stored in Redux state.',
        },
        {
          lineStart: 33,
          lineEnd: 33,
          type: "fix",
          title: "Missing aria-describedby on password input",
          description:
            "The password input has no aria-describedby linking it to the error message. Screen readers cannot associate the validation error with the field.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 14,
          lineEnd: 16,
          type: "fix",
          title: "Error state cleared on mount",
          description:
            "A useEffect dispatches clearError() when the component mounts, preventing stale errors from a previous screen from persisting.",
        },
        {
          lineStart: 26,
          lineEnd: 29,
          type: "fix",
          title: "Dynamic error from API response",
          description:
            "The error message comes from the Redux store, which is populated from the server response via rejectWithValue. Users see the actual reason their login failed.",
        },
        {
          lineStart: 37,
          lineEnd: 37,
          type: "fix",
          title: "aria-describedby connects input to error",
          description:
            'The password input links to "password-error" via aria-describedby, and the error paragraph has a matching id. Screen readers now announce the error when the field is focused.',
        },
      ],
    },
    {
      filename: "forgot-password-form.tsx",
      aiGenerated: `export function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordValues) {
    dispatch(requestPasswordReset(data));
  }

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}`,
      production: `export function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  function onSubmit(data: ForgotPasswordValues) {
    dispatch(requestPasswordReset(data));
  }

  const isLoading = status === "loading";

  if (status === "succeeded") {
    return (
      <div className="grid gap-4 text-center">
        <CheckCircle className="mx-auto size-10 text-green-500" />
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a password reset link to your email address.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 19,
          lineEnd: 39,
          type: "fix",
          title: "No success state handling",
          description:
            'After a successful submission, the form re-renders empty instead of showing a "Check your email" confirmation. The AI always renders the form regardless of status.',
        },
      ],
      prodAnnotations: [
        {
          lineStart: 20,
          lineEnd: 30,
          type: "fix",
          title: "Success state rendered before form",
          description:
            'The component checks status === "succeeded" before rendering the form. On success, users see a confirmation message with a check icon instead of a blank form.',
        },
      ],
    },
  ],
};
