"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { applyTheme, readTheme, saveTheme, subscribeTheme, themes, type Theme } from "@/lib/theme";
import { cn } from "@/lib/cn";

const icons = { system: Monitor, light: Sun, dark: Moon } satisfies Record<Theme, unknown>;

/**
 * The highlighted button is driven by CSS from <html data-theme>, not by React state.
 * The head script sets data-theme before first paint, so the correct button is
 * highlighted from the very first frame — no flicker on refresh.
 * (Static classes so Tailwind can see them.)
 */
const activeWhen: Record<Theme, string> = {
  system:
    "[:root:not([data-theme])_&]:bg-brand [:root:not([data-theme])_&]:text-white [:root:not([data-theme])_&]:hover:text-white",
  light:
    "[:root[data-theme=light]_&]:bg-brand [:root[data-theme=light]_&]:text-white [:root[data-theme=light]_&]:hover:text-white",
  dark: "[:root[data-theme=dark]_&]:bg-brand [:root[data-theme=dark]_&]:text-white [:root[data-theme=dark]_&]:hover:text-white",
};

/** System / Light / Dark switch. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { dict } = useI18n();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "system" as Theme);

  // In development React can reset <html> attributes on remount; re-apply the saved theme.
  useLayoutEffect(() => {
    applyTheme(readTheme());
  }, []);

  const labels: Record<Theme, string> = {
    system: dict.common.themeSystem,
    light: dict.common.themeLight,
    dark: dict.common.themeDark,
  };

  return (
    <div
      role="group"
      aria-label={dict.common.theme}
      className={cn("flex items-center gap-0.5 rounded-lg bg-surface-2 p-1", className)}
    >
      {themes.map((t) => {
        const Icon = icons[t];
        return (
          <button
            key={t}
            type="button"
            onClick={() => saveTheme(t)}
            // For screen readers only; the visual highlight comes from CSS (see activeWhen).
            aria-pressed={t === theme}
            title={labels[t]}
            className={cn(
              "flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:text-fg sm:size-9",
              activeWhen[t],
            )}
          >
            <Icon className="size-[18px]" aria-hidden="true" />
            <span className="sr-only">{labels[t]}</span>
          </button>
        );
      })}
    </div>
  );
}
