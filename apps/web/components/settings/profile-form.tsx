"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  updateProfile,
  clearSettingsError,
  resetSaveStatus,
} from "@/features/settings/settingsSlice";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
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
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={settings?.profile.email ?? ""}
          disabled
          readOnly
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Your email address cannot be changed.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell us a little about yourself"
          disabled={isSaving}
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? "bio-error" : undefined}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
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
}
