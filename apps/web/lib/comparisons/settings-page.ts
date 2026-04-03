import type { ComparisonExample } from "./types";

export const settingsPageComparison: ComparisonExample = {
  slug: "settings-page",
  title: "Settings Page",
  description:
    "Profile and notification settings forms. AI output missed dirty state tracking, form reset after save, success toasts, and optimistic updates on toggles. The production version fixes all issues found in review.",
  issueCount: 6,
  files: [
    {
      filename: "profile-form.tsx",
      aiGenerated: `export function ProfileForm() {
  const dispatch = useAppDispatch();
  const { settings, saveStatus, error } = useAppSelector(
    (state) => state.settings
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      name: settings?.profile.name ?? "",
      bio: settings?.profile.bio ?? "",
    },
  });

  useEffect(() => {
    dispatch(clearSettingsError());
  }, [dispatch]);

  function onSubmit(data: ProfileValues) {
    dispatch(updateProfile({ name: data.name, bio: data.bio ?? "" }));
  }

  const isSaving = saveStatus === "saving";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      {error && saveStatus === "failed" && (
        <div role="alert" className="text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          disabled={isSaving}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell us a little about yourself"
          disabled={isSaving}
          aria-invalid={!!errors.bio}
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-destructive">
            {errors.bio.message}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}`,
      production: `export function ProfileForm() {
  const dispatch = useAppDispatch();
  const { settings, saveStatus, error } = useAppSelector(
    (state) => state.settings
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      name: settings?.profile.name ?? "",
      bio: settings?.profile.bio ?? "",
    },
  });

  // Reset form when settings are loaded/updated after a successful save
  useEffect(() => {
    if (settings && saveStatus === "succeeded") {
      reset({
        name: settings.profile.name,
        bio: settings.profile.bio,
      });
      toast.success("Profile updated.");
      dispatch(resetSaveStatus());
    }
  }, [settings, saveStatus, reset, dispatch]);

  // Reset form defaults when settings first load
  useEffect(() => {
    if (settings) {
      reset({
        name: settings.profile.name,
        bio: settings.profile.bio,
      });
    }
  }, [settings?.profile.name, settings?.profile.bio, reset]);

  useEffect(() => {
    dispatch(clearSettingsError());
  }, [dispatch]);

  function onSubmit(data: ProfileValues) {
    dispatch(updateProfile({ name: data.name, bio: data.bio ?? "" }));
  }

  const isSaving = saveStatus === "saving";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6" noValidate>
      {error && saveStatus === "failed" && (
        <div role="alert" className="text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          disabled={isSaving}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell us a little about yourself"
          disabled={isSaving}
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? "bio-error" : undefined}
          {...register("bio")}
        />
        {errors.bio && (
          <p id="bio-error" className="text-sm text-destructive">
            {errors.bio.message}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" disabled={!isDirty || isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" aria-hidden="true" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 7,
          lineEnd: 11,
          type: "fix",
          title: "No isDirty tracking from formState",
          description:
            "The AI destructured formState but only pulled out errors. Without isDirty, the save button is always enabled even when the user has made no changes.",
        },
        {
          lineStart: 73,
          lineEnd: 75,
          type: "fix",
          title: "Save button always enabled",
          description:
            'The button is disabled only when isSaving is true. It should also be disabled when the form is clean (!isDirty). Users can spam save with unchanged data.',
        },
        {
          lineStart: 22,
          lineEnd: 28,
          type: "fix",
          title: "No form reset after successful save",
          description:
            "After a successful save, the form's default values are not updated. isDirty stays true because react-hook-form still thinks the current values differ from the original defaults. form.reset() with new values is needed.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 9,
          lineEnd: 11,
          type: "fix",
          title: "isDirty and reset extracted from formState",
          description:
            "Both isDirty and reset are destructured so the component can track dirty state and reset the form baseline after a successful save.",
        },
        {
          lineStart: 23,
          lineEnd: 34,
          type: "fix",
          title: "Form reset + toast on save success",
          description:
            'A useEffect watches for saveStatus === "succeeded", then calls reset() with the new settings values. This clears isDirty and shows a sonner toast. resetSaveStatus() prevents the effect from re-triggering.',
        },
        {
          lineStart: 93,
          lineEnd: 93,
          type: "fix",
          title: "Save button disabled when form is clean",
          description:
            "disabled={!isDirty || isSaving} ensures the button is only clickable when the user has actually changed something.",
        },
      ],
    },
    {
      filename: "notifications-form.tsx",
      aiGenerated: `export function NotificationsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.settings);
  const saveStatus = useAppSelector((state) => state.settings.saveStatus);

  const notifications = settings?.notifications;

  const handleToggle = useCallback(
    (
      field: keyof NonNullable<typeof notifications>,
      newValue: boolean
    ) => {
      if (!notifications) return;

      const updatedNotifications = {
        ...notifications,
        [field]: newValue,
      };

      // Save to API then update UI
      dispatch(updateNotifications(updatedNotifications));
    },
    [dispatch, notifications]
  );

  const isSaving = saveStatus === "saving";

  if (!notifications) return null;

  return (
    <div className="grid gap-4">
      <NotificationToggle
        id="email-notifications"
        label="Email notifications"
        description="Receive email notifications about account activity."
        checked={notifications.emailNotifications}
        disabled={isSaving}
        onToggle={(checked) => handleToggle("emailNotifications", checked)}
      />
      <NotificationToggle
        id="push-notifications"
        label="Push notifications"
        description="Receive push notifications in your browser."
        checked={notifications.pushNotifications}
        disabled={isSaving}
        onToggle={(checked) => handleToggle("pushNotifications", checked)}
      />
      <NotificationToggle
        id="marketing-emails"
        label="Marketing emails"
        description="Receive emails about new features and updates."
        checked={notifications.marketingEmails}
        disabled={isSaving}
        onToggle={(checked) => handleToggle("marketingEmails", checked)}
      />
    </div>
  );
}`,
      production: `export function NotificationsForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.settings);

  const notifications = settings?.notifications;

  const handleToggle = useCallback(
    (
      field: keyof NonNullable<typeof notifications>,
      newValue: boolean
    ) => {
      if (!notifications) return;

      const previousNotifications = { ...notifications };
      const updatedNotifications = {
        ...notifications,
        [field]: newValue,
      };

      // Optimistic update -- UI changes immediately
      dispatch(optimisticUpdateNotifications(updatedNotifications));

      // Persist to API
      dispatch(updateNotifications(updatedNotifications))
        .unwrap()
        .catch(() => {
          // Rollback on failure
          dispatch(optimisticUpdateNotifications(previousNotifications));
          toast.error("Failed to update notification preferences.");
        });
    },
    [dispatch, notifications]
  );

  if (!notifications) return null;

  return (
    <div className="grid gap-4">
      <NotificationToggle
        id="email-notifications"
        label="Email notifications"
        description="Receive email notifications about account activity."
        checked={notifications.emailNotifications}
        onToggle={(checked) => handleToggle("emailNotifications", checked)}
      />
      <NotificationToggle
        id="push-notifications"
        label="Push notifications"
        description="Receive push notifications in your browser."
        checked={notifications.pushNotifications}
        onToggle={(checked) => handleToggle("pushNotifications", checked)}
      />
      <NotificationToggle
        id="marketing-emails"
        label="Marketing emails"
        description="Receive emails about new features and updates."
        checked={notifications.marketingEmails}
        onToggle={(checked) => handleToggle("marketingEmails", checked)}
      />
    </div>
  );
}`,
      aiAnnotations: [
        {
          lineStart: 14,
          lineEnd: 21,
          type: "fix",
          title: "No optimistic update -- toggle waits for API",
          description:
            "The AI dispatches updateNotifications and waits for the API response before the checkbox visually toggles. This creates a 600-800ms delay where the toggle appears stuck.",
        },
        {
          lineStart: 14,
          lineEnd: 21,
          type: "fix",
          title: "No rollback on failure",
          description:
            "If the API call fails, the UI stays in whatever state it ended up in. There is no mechanism to restore the previous notification preferences.",
        },
      ],
      prodAnnotations: [
        {
          lineStart: 14,
          lineEnd: 21,
          type: "fix",
          title: "Optimistic update with rollback",
          description:
            "The previous state is captured before the update. optimisticUpdateNotifications changes the UI immediately. If the async thunk fails, the previous state is restored and a toast.error notifies the user.",
        },
        {
          lineStart: 23,
          lineEnd: 30,
          type: "fix",
          title: "Error recovery with toast feedback",
          description:
            "The .unwrap().catch() pattern detects API failures and rolls back the optimistic update. A sonner toast tells the user the save failed, so they know their change did not persist.",
        },
      ],
    },
  ],
};
