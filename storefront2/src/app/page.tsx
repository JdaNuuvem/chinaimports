import { getThemeConfig } from "@/lib/theme-config";
import DynamicSection from "@/components/DynamicSection";

export default function HomePage() {
  const config = getThemeConfig();

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
