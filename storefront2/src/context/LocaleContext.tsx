"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import ptBR from "@/data/locales/pt-BR.json";
import en from "@/data/locales/en.json";
import es from "@/data/locales/es.json";

// ── Types ──

export type Locale = "pt-BR" | "en" | "es";

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
  rate: number; // exchange rate relative to BRL (BRL = 1)
}

export const SUPPORTED_LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: "pt-BR", label: "Português", flag: "🇧🇷" },
  { id: "en", label: "English", flag: "🇺🇸" },
  { id: "es", label: "Español", flag: "🇪🇸" },
];

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "BRL", symbol: "R$", locale: "pt-BR", rate: 1 },
  { code: "USD", symbol: "$", locale: "en-US", rate: 0.18 },
  { code: "EUR", symbol: "€", locale: "de-DE", rate: 0.17 },
];

const LOCALE_MESSAGES: Record<Locale, Record<string, string>> = {
  "pt-BR": ptBR,
  en,
  es,
};

// ── Context ──

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: CurrencyConfig;
  setCurrency: (code: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  formatMoney: (amountInCentsBRL: number) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

// ── Provider ──

export function LocaleProvider({ children }: { children: ReactNode }) {
  // ALWAYS start with the default on both server and client so the first
  // render matches. Then read localStorage in useEffect after mount.
  // Doing this in useState's lazy init would make the client render
  // different text than the server, causing React error #418.
  const [locale, setLocaleState] = useState<Locale>("pt-BR");
  const [currency, setCurrencyState] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]);

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem("ua_locale") as Locale | null;
      if (savedLocale && LOCALE_MESSAGES[savedLocale] && savedLocale !== "pt-BR") {
        setLocaleState(savedLocale);
      }
      const savedCurrency = localStorage.getItem("ua_currency");
      if (savedCurrency) {
        const found = SUPPORTED_CURRENCIES.find((c) => c.code === savedCurrency);
        if (found && found.code !== SUPPORTED_CURRENCIES[0].code) {
          setCurrencyState(found);
        }
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("ua_locale", l);
    document.documentElement.lang = l;
  }, []);

  const setCurrency = useCallback((code: string) => {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyState(found);
      localStorage.setItem("ua_currency", code);
    }
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string>): string => {
    const messages = LOCALE_MESSAGES[locale] || LOCALE_MESSAGES["pt-BR"];
    let text = messages[key] || LOCALE_MESSAGES["pt-BR"][key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }
    return text;
  }, [locale]);

  const formatMoney = useCallback((amountInCentsBRL: number): string => {
    const converted = Math.round(amountInCentsBRL * currency.rate);
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
    }).format(converted / 100);
  }, [currency]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, currency, setCurrency, t, formatMoney }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
