"use client";

import { useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchSettings } from "@/features/settings/settingsSlice";
import { SettingsLayout } from "@/components/settings/settings-layout";
import { ProfileForm } from "@/components/settings/profile-form";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { AppearanceForm } from "@/components/settings/appearance-form";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[60px]" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-[120px]" />
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  const isLoading = status === "loading" || status === "idle";
  const isFailed = status === "failed";

  return (
    <SettingsLayout>
      {isFailed ? (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Failed to load settings</p>
          <p className="mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchSettings())}
          >
            Try again
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground">
                Update your personal information.
              </p>
            </div>
            {isLoading ? <SettingsSkeleton /> : <ProfileForm />}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Configure how you receive notifications.
              </p>
            </div>
            {isLoading ? <SettingsSkeleton /> : <NotificationsForm />}
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of the application.
              </p>
            </div>
            {isLoading ? <SettingsSkeleton /> : <AppearanceForm />}
          </TabsContent>
        </Tabs>
      )}
    </SettingsLayout>
  );
}
