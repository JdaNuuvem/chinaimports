import { readThemeConfigFromDisk } from "@/lib/theme-config.server";
import DynamicSection from "@/components/DynamicSection";

// Sempre ler o config do disco a cada request para refletir
// alterações feitas no painel admin imediatamente.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const config = readThemeConfigFromDisk();

  return (
    <>
      {config.homeSections
        .filter((section) => section.enabled)
        .map((section) => (
          <DynamicSection key={section.id} section={section} />
        ))}
    </>
  );
}
