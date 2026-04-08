"use client";

import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import type { ThemeConfig } from "@/lib/theme-config";
import { setRuntimeConfig } from "@/lib/theme-config";

const ThemeConfigContext = createContext<ThemeConfig | null>(null);

interface ThemeConfigProviderProps {
  config: ThemeConfig;
  children: ReactNode;
}

export function ThemeConfigProvider({ config, children }: ThemeConfigProviderProps) {
  // Keep the module-level runtimeConfig in sync so legacy code that calls
  // getThemeConfig() directly (without useThemeConfig) still gets the
  // latest server-provided values on the client.
  useMemo(() => setRuntimeConfig(config), [config]);
  useEffect(() => {
    setRuntimeConfig(config);
    return () => setRuntimeConfig(null);
  }, [config]);

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
