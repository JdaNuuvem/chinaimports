"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyLoadProps {
  children: ReactNode;
  rootMargin?: string;
  placeholder?: ReactNode;
}

/**
 * Renders children only when they scroll into view.
 * Uses IntersectionObserver for efficient viewport detection.
 */
export default function LazyLoad({ children, rootMargin = "200px", placeholder }: LazyLoadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  if (visible) return <>{children}</>;

  return (
    <div ref={ref} style={{ minHeight: 100 }}>
      {placeholder || (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 100, color: "#e5e7eb" }}>
          <div style={{ width: 24, height: 24, border: "2px solid #e5e7eb", borderTopColor: "#9ca3af", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}
    </div>
  );
}
