import type { HomeSection } from "@/lib/theme-config";
import Slideshow from "@/components/Slideshow";
import FeaturedCollection from "@/components/FeaturedCollection";
import Mosaic from "@/components/Mosaic";
import InfoBar from "@/components/InfoBar";
import TextWithIcons from "@/components/TextWithIcons";
import ImageWithText from "@/components/ImageWithText";
import CollectionList from "@/components/CollectionList";
import Offers from "@/components/Offers";
import LogoList from "@/components/LogoList";
import VideoShowcase from "@/components/VideoShowcase";
import BrandShowcase from "@/components/BrandShowcase";
import RichText from "@/components/RichText";

interface DynamicSectionProps {
  section: HomeSection;
}

export default function DynamicSection({ section }: DynamicSectionProps) {
  const s = section.settings;

  switch (section.type) {
    case "slideshow": {
      const configSlides = s.slides as Array<{ imageUrl?: string; mobileImageUrl?: string; title?: string; subtitle?: string; buttonLink?: string; imageOnly?: boolean }> | undefined;
      const slides = configSlides?.length ? configSlides.map((slide, i) => ({
        id: String(i + 1),
        image: slide.imageUrl || "",
        mobileImage: slide.mobileImageUrl,
        title: slide.title,
        content: slide.subtitle,
        link: slide.buttonLink,
        textColor: (s.textColor as string) || "#ffffff",
        imageOnly: slide.imageOnly,
      })) : undefined;
      return <Slideshow slides={slides} autoPlay={s.autoplay as boolean} cycleSpeed={s.autoplayInterval as number} />;
    }

    case "text-with-icons": {
      const configItems = s.items as Array<{ icon: string; iconImage?: string; text: string; content?: string }> | undefined;
      const iconMap: Record<string, string> = { truck: "🚚", refresh: "↩️", shield: "🔒", "credit-card": "💳", star: "⭐", gift: "🎁", heart: "❤️", check: "✅" };
      const items = configItems?.length ? configItems.map((item) => ({
        icon: iconMap[item.icon] || item.icon,
        iconImage: item.iconImage,
        title: item.text,
        content: item.content,
      })) : undefined;
      return <TextWithIcons items={items} />;
    }

    case "mosaic": {
      const configBlocks = s.blocks as Array<{ imageUrl?: string; title?: string; link?: string }> | undefined;
      const items = configBlocks?.length ? configBlocks.map((block, i) => ({
        id: String(i + 1),
        image: block.imageUrl,
        title: block.title,
        link: block.link,
        textColor: "#fff",
        buttonText: "Ver coleção",
      })) : undefined;
      return (
        <div style={{ padding: "40px 0" }}>
          <Mosaic items={items} />
        </div>
      );
    }

    case "featured-collection":
      return (
        <div style={{ padding: "40px 0" }}>
          <FeaturedCollection
            title={s.title as string}
            linkTitle={s.linkTitle as string}
            linkUrl={s.linkUrl as string}
          />
        </div>
      );

    case "offers": {
      const configOffers = s.items as Array<{ imageUrl?: string; title?: string; description?: string; link?: string; backgroundColor?: string; textColor?: string }> | undefined;
      const offers = configOffers?.length ? configOffers.map((item, i) => ({
        id: String(i + 1),
        title: item.title || "",
        description: item.description,
        link: item.link,
        imageUrl: item.imageUrl,
        backgroundColor: item.backgroundColor || "#1e2d7d",
        textColor: item.textColor || "#fff",
      })) : undefined;
      return <Offers offers={offers} />;
    }

    case "image-with-text":
      return (
        <div style={{ padding: "40px 0" }}>
          <ImageWithText
            title={s.title as string}
            content={s.content as string}
            buttonText={s.buttonText as string}
            buttonLink={s.buttonLink as string}
            image={s.imageUrl as string}
            imagePosition={(s.imagePosition as "left" | "right") || "left"}
          />
        </div>
      );

    case "collection-list":
      return (
        <div style={{ padding: "40px 0" }}>
          <CollectionList title={s.title as string} />
        </div>
      );

    case "info-bar":
      return <InfoBar />;

    case "logo-list":
      return (
        <div style={{ padding: "40px 0" }}>
          <LogoList title={s.title as string} />
        </div>
      );

    case "video":
      return <VideoShowcase title={s.title as string} videos={(s.videos as Array<{ url: string; title?: string }>) || []} />;

    case "brand-showcase":
      return <BrandShowcase title={s.title as string} brands={(s.brands as Array<{ name: string; logoUrl: string; link?: string }>) || []} />;

    case "rich-text":
      return <RichText title={s.title as string} content={s.content as string} />;

    default:
      return null;
  }
}
