"use client";

import { createContext, useContext, ReactNode } from "react";
import type { ThemeConfig } from "@/lib/theme-config";
import { setRuntimeConfig } from "@/lib/theme-config";

const ThemeConfigContext = createContext<ThemeConfig | null>(null);

interface ThemeConfigProviderProps {
  config: ThemeConfig;
  children: ReactNode;
}

export function ThemeConfigProvider({ config, children }: ThemeConfigProviderProps) {
  // Sync the module-level runtimeConfig during render (BEFORE children run).
  // This guarantees Header/Footer/etc that call the synchronous
  // getThemeConfig() helper always see the current request's config on
  // both server and client, avoiding React hydration mismatches (#418)
  // caused by a stale runtimeConfig leaking between requests or tabs.
  // Setting a module-level variable is idempotent so it's safe in render.
  setRuntimeConfig(config);

  return (
    <ThemeConfigContext.Provider value={config}>
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig(): ThemeConfig {
  const ctx = useContext(ThemeConfigContext);
  if (!ctx) {
    throw new Error("useThemeConfig must be used inside <ThemeConfigProvider>");
  }
  return ctx;
}
