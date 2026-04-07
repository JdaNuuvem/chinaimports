"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
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

function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const saved = localStorage.getItem("ua_locale") as Locale | null;
  return saved && LOCALE_MESSAGES[saved] ? saved : "pt-BR";
}

function getSavedCurrency(): CurrencyConfig {
  if (typeof window === "undefined") return SUPPORTED_CURRENCIES[0];
  const saved = localStorage.getItem("ua_currency");
  return SUPPORTED_CURRENCIES.find((c) => c.code === saved) || SUPPORTED_CURRENCIES[0];
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getSavedLocale);
  const [currency, setCurrencyState] = useState<CurrencyConfig>(getSavedCurrency);

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
