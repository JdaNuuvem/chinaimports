// Legacy translation module — kept for backward compatibility with Server Components
// For Client Components, use useLocale().t() from LocaleContext instead

import ptBR from "@/data/locales/pt-BR.json";

export const t = ptBR;

export function translate(key: string, replacements?: Record<string, string>): string {
  let text = (t as Record<string, string>)[key] || key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{{${k}}}`, v);
    });
  }
  return text;
}
