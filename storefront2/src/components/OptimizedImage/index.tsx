import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
}

/**
 * Wrapper around next/image with sensible defaults for e-commerce.
 * Falls back to regular img for external URLs not in remotePatterns.
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  className,
  style,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: OptimizedImageProps) {
  // Check if src is from known remote patterns
  const isOptimizable = src.startsWith("/") ||
    src.includes("cdn.shopify.com") ||
    src.includes("medusa-public-images") ||
    src.includes("localhost");

  if (!isOptimizable || !src) {
    // Fallback to regular img for unknown hosts
    return (
      <img
        src={src || "https://placehold.co/400x400/f5f5f5/999?text=Sem+Imagem"}
        alt={alt}
        className={className}
        style={{ ...style, objectFit: "cover" }}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        style={{ objectFit: "cover", ...style }}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 400}
      height={height || 400}
      priority={priority}
      className={className}
      style={{ objectFit: "cover", ...style }}
      sizes={sizes}
    />
  );
}
