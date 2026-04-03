"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  updateAppearance,
  optimisticUpdateAppearance,
} from "@/features/settings/settingsSlice";

export function AppearanceForm() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings.settings);

  const appearance = settings?.appearance;

  const handleThemeChange = useCallback(
    (theme: string | null) => {
      if (!appearance || !theme) return;

      const previousAppearance = { ...appearance };
      const updatedAppearance = {
        ...appearance,
        theme: theme as "light" | "dark" | "system",
      };

      // Optimistic update
      dispatch(optimisticUpdateAppearance(updatedAppearance));

      // Apply theme immediately via document attribute (next-themes reads this)
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute(
          "data-theme-preference",
          theme
        );
      }

      // Persist to API
      dispatch(updateAppearance(updatedAppearance))
        .unwrap()
        .catch(() => {
          dispatch(optimisticUpdateAppearance(previousAppearance));
          toast.error("Failed to update appearance settings.");
        });
    },
    [dispatch, appearance]
  );

  const handleFontSizeChange = useCallback(
    (fontSize: string | null) => {
      if (!fontSize) return;
      if (!appearance) return;

      const previousAppearance = { ...appearance };
      const updatedAppearance = {
        ...appearance,
        fontSize: fontSize as "small" | "default" | "large",
      };

      // Optimistic update
      dispatch(optimisticUpdateAppearance(updatedAppearance));

      // Apply font size immediately
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-font-size", fontSize);
      }

      // Persist to API
      dispatch(updateAppearance(updatedAppearance))
        .unwrap()
        .catch(() => {
          dispatch(optimisticUpdateAppearance(previousAppearance));
          toast.error("Failed to update appearance settings.");
        });
    },
    [dispatch, appearance]
  );

  if (!appearance) return null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={appearance.theme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme" className="w-[200px]">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Select the theme for the application.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="font-size">Font size</Label>
        <Select
          value={appearance.fontSize}
          onValueChange={handleFontSizeChange}
        >
          <SelectTrigger id="font-size" className="w-[200px]">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Set the font size for the application interface.
        </p>
      </div>
    </div>
  );
}
