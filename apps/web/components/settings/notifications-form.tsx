"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  updateNotifications,
  optimisticUpdateNotifications,
} from "@/features/settings/settingsSlice";

interface NotificationToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

function NotificationToggle({
  id,
  label,
  description,
  checked,
  onToggle,
}: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-base font-medium">
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onToggle(value === true)}
        aria-label={label}
      />
    </div>
  );
}

export function NotificationsForm() {
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

      // Optimistic update
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
}
