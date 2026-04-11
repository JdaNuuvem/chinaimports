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

// Mapeia os dados salvos pelo SectionEditor (admin) para os props
// que cada componente de renderização realmente espera. Os nomes
// dos campos no editor e nos componentes divergiram historicamente,
// então este arquivo é o ponto único de tradução. Se um array vier
// vazio retornamos `null` em vez de cair em placeholders mockados.
export default function DynamicSection({ section }: DynamicSectionProps) {
  const s = section.settings;

  switch (section.type) {
    case "slideshow": {
      const configSlides = s.slides as
        | Array<{ imageUrl?: string; mobileImageUrl?: string; title?: string; subtitle?: string; buttonLink?: string; imageOnly?: boolean }>
        | undefined;
      if (!configSlides?.length) return null;
      const slides = configSlides.map((slide, i) => ({
        id: String(i + 1),
        image: slide.imageUrl || "",
        mobileImage: slide.mobileImageUrl,
        title: slide.title,
        content: slide.subtitle,
        link: slide.buttonLink,
        textColor: (s.textColor as string) || "#ffffff",
        imageOnly: slide.imageOnly,
      }));
      return (
        <Slideshow
          slides={slides}
          autoPlay={s.autoplay as boolean}
          cycleSpeed={s.autoplayInterval as number}
          imageHeight={s.imageHeight as number | undefined}
          imageHeightMobile={s.imageHeightMobile as number | undefined}
        />
      );
    }

    case "text-with-icons": {
      const configItems = s.items as
        | Array<{ icon?: string; iconImage?: string; title?: string; text?: string }>
        | undefined;
      if (!configItems?.length) return null;
      const iconMap: Record<string, string> = { truck: "🚚", refresh: "↩️", shield: "🔒", "credit-card": "💳", star: "⭐", gift: "🎁", heart: "❤️", check: "✅" };
      const items = configItems.map((item) => ({
        icon: iconMap[item.icon || ""] || item.icon || "",
        iconImage: item.iconImage,
        title: item.title || "",
        content: item.text,
      }));
      return (
        <TextWithIcons
          items={items}
          imageHeight={s.imageHeight as number | undefined}
          imageHeightMobile={s.imageHeightMobile as number | undefined}
        />
      );
    }

    case "mosaic": {
      // Aceita tanto `items` (formato do editor) quanto `blocks` (legado).
      const configBlocks = (s.items || s.blocks) as
        | Array<{ image?: string; imageUrl?: string; title?: string; link?: string }>
        | undefined;
      if (!configBlocks?.length) return null;
      const items = configBlocks.map((block, i) => ({
        id: String(i + 1),
        image: block.image || block.imageUrl,
        title: block.title,
        link: block.link,
        textColor: "#fff",
        buttonText: "Ver coleção",
      }));
      return (
        <div style={{ padding: "40px 0" }}>
          <Mosaic
            items={items}
            imageHeight={s.imageHeight as number | undefined}
            imageHeightMobile={s.imageHeightMobile as number | undefined}
          />
        </div>
      );
    }

    case "featured-collection":
      return (
        <div style={{ padding: "40px 0" }}>
          <FeaturedCollection
            title={s.title as string}
            collectionHandle={s.collectionHandle as string}
            productsToShow={(s.limit as number) || 8}
            linkTitle={s.linkTitle as string}
            linkUrl={
              (s.linkUrl as string) ||
              (s.collectionHandle ? `/collections/${s.collectionHandle as string}` : undefined)
            }
          />
        </div>
      );

    case "offers": {
      const configOffers = s.items as
        | Array<{ image?: string; imageUrl?: string; title?: string; subtitle?: string; description?: string; link?: string; backgroundColor?: string; textColor?: string }>
        | undefined;
      if (!configOffers?.length) return null;
      const offers = configOffers.map((item, i) => ({
        id: String(i + 1),
        title: item.title || "",
        description: item.description || item.subtitle,
        link: item.link,
        image: item.image || item.imageUrl,
        backgroundColor: item.backgroundColor || "#1e2d7d",
        textColor: item.textColor || "#fff",
      }));
      return (
        <Offers
          offers={offers}
          imageHeight={s.imageHeight as number | undefined}
          imageHeightMobile={s.imageHeightMobile as number | undefined}
        />
      );
    }

    case "image-with-text":
      return (
        <div style={{ padding: "40px 0" }}>
          <ImageWithText
            title={s.title as string}
            content={(s.text as string) || (s.content as string)}
            buttonText={s.buttonText as string}
            buttonLink={(s.buttonUrl as string) || (s.buttonLink as string)}
            image={(s.image as string) || (s.imageUrl as string)}
            imagePosition={(s.imagePosition as "left" | "right") || "left"}
            imageHeight={s.imageHeight as number | undefined}
            imageHeightMobile={s.imageHeightMobile as number | undefined}
          />
        </div>
      );

    case "collection-list":
      return (
        <div style={{ padding: "40px 0" }}>
          <CollectionList
            title={s.title as string}
            columns={(s.columns as number) || 3}
            rows={(s.rows as number | undefined) || 0}
            blockStyle={(s.blockStyle as "contained" | "image-fit") || "contained"}
            showTitles={(s.showTitles as boolean | undefined) ?? true}
            enableHoverAnimation={(s.enableHoverAnimation as boolean | undefined) ?? true}
          />
        </div>
      );

    case "info-bar": {
      const configItems = s.items as Array<{ icon?: string; text?: string; title?: string; description?: string }> | undefined;
      if (!configItems?.length) return null;
      const items = configItems.map((item) => ({
        icon: item.icon || "",
        title: item.title || item.text || "",
        description: item.description || "",
      }));
      return <InfoBar items={items} />;
    }

    case "logo-list": {
      const configLogos = s.logos as Array<{ name?: string; image?: string; url?: string }> | undefined;
      if (!configLogos?.length) {
        // Renderiza só o título quando não há logos
        return (
          <div style={{ padding: "40px 0" }}>
            <LogoList
              title={s.title as string}
              logos={[]}
              imageHeight={s.imageHeight as number | undefined}
              imageHeightMobile={s.imageHeightMobile as number | undefined}
            />
          </div>
        );
      }
      const logos = configLogos
        .filter((l) => !!l.image)
        .map((logo, i) => ({
          id: String(i + 1),
          image: logo.image || "",
          alt: logo.name,
          link: logo.url,
        }));
      return (
        <div style={{ padding: "40px 0" }}>
          <LogoList
            title={s.title as string}
            logos={logos}
            imageHeight={s.imageHeight as number | undefined}
            imageHeightMobile={s.imageHeightMobile as number | undefined}
          />
        </div>
      );
    }

    case "video": {
      // Editor salva 1 vídeo (videoUrl). Renderer aceita um array.
      const configVideos = s.videos as Array<{ url: string; title?: string }> | undefined;
      const singleUrl = s.videoUrl as string | undefined;
      const videos = configVideos?.length
        ? configVideos
        : singleUrl
          ? [{ url: singleUrl, title: s.title as string | undefined }]
          : [];
      if (videos.length === 0) return null;
      return <VideoShowcase title={s.title as string} videos={videos} />;
    }

    case "brand-showcase": {
      // Editor salva 1 marca (image, text). Renderer aceita um array.
      const configBrands = s.brands as Array<{ name: string; logoUrl: string; link?: string }> | undefined;
      const singleImage = s.image as string | undefined;
      const brands = configBrands?.length
        ? configBrands
        : singleImage
          ? [{ name: (s.text as string) || (s.title as string) || "", logoUrl: singleImage }]
          : [];
      if (brands.length === 0) return null;
      return (
        <BrandShowcase
          title={s.title as string}
          brands={brands}
          imageHeight={s.imageHeight as number | undefined}
          imageHeightMobile={s.imageHeightMobile as number | undefined}
        />
      );
    }

    case "rich-text":
      return <RichText title={s.title as string} content={s.content as string} />;

    default:
      return null;
  }
}
