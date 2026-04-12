"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { getThemeConfig } from "@/lib/theme-config";

const FIRST_NAMES = ["João", "Maria", "Pedro", "Ana", "Carlos", "Juliana", "Rafael", "Fernanda", "Lucas", "Camila", "Bruno", "Larissa", "Diego", "Patrícia", "Thiago", "Beatriz"];
const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Fortaleza", "Recife", "Brasília", "Florianópolis", "Goiânia", "Manaus"];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type ProductLite = { title: string; handle: string };

export default function SocialProof() {
  const config = getThemeConfig();
  const sp = config.socialProof;

  // Disabled via admin
  if (sp?.enabled === false) return null;

  const displayDuration = (sp?.displayDuration ?? 5) * 1000;
  const intervalMin = (sp?.intervalMin ?? 20) * 1000;
  const intervalMax = (sp?.intervalMax ?? 40) * 1000;
  // Parse handles filter — stored as newline-separated string
  const allowedHandles = (sp?.productHandles || "")
    .split("\n")
    .map((h) => h.trim())
    .filter(Boolean);

  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "", product: "", handle: "", minutes: 0 });
  const productsRef = useRef<ProductLite[]>([]);

  // Don't render on admin/checkout.
  const hidden = !pathname || pathname.startsWith("/admin") || pathname.startsWith("/checkout");
  const isProductPage = !!pathname?.startsWith("/produto");

  // Fetch real products once on mount
  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    fetch("/api/medusa/store/products?limit=30")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.products) return;
        let prods: ProductLite[] = json.products
          .filter((p: { title?: string; handle?: string }) => p.title && p.handle)
          .map((p: { title: string; handle: string }) => ({ title: p.title, handle: p.handle }));
        // Filter by allowed handles if configured
        if (allowedHandles.length > 0) {
          const allowedSet = new Set(allowedHandles);
          prods = prods.filter((p) => allowedSet.has(p.handle));
        }
        productsRef.current = prods;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden]);

  const showNotification = useCallback(() => {
    const product = productsRef.current.length > 0 ? random(productsRef.current) : null;
    if (!product) return;
    setData({
      name: random(FIRST_NAMES),
      city: random(CITIES),
      product: product.title,
      handle: product.handle,
      minutes: Math.floor(Math.random() * 15) + 1,
    });
    setVisible(true);
    setTimeout(() => setVisible(false), displayDuration);
  }, [displayDuration]);

  useEffect(() => {
    if (hidden) return;
    const firstDelay = intervalMin + Math.random() * (intervalMax - intervalMin) / 2;
    const firstTimeout = setTimeout(showNotification, firstDelay);
    const interval = setInterval(() => {
      if (Math.random() > 0.3) showNotification();
    }, intervalMin + Math.random() * (intervalMax - intervalMin));
    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [showNotification, hidden, intervalMin, intervalMax]);

  if (hidden || !visible) return null;

  return (
    <div className={`social-proof-toast${isProductPage ? " social-proof-toast--top" : ""}`} onClick={() => setVisible(false)}>
      <div className="social-proof-toast__icon">🛒</div>
      <div className="social-proof-toast__body">
        <div className="social-proof-toast__line1">
          <strong>{data.name}</strong> de <strong>{data.city}</strong> comprou
        </div>
        <div className="social-proof-toast__product">{data.product}</div>
        <div className="social-proof-toast__time">
          há {data.minutes} minuto{data.minutes > 1 ? "s" : ""}
        </div>
      </div>
      <button
        className="social-proof-toast__close"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        aria-label="Fechar"
      >
        ×
      </button>
      <style jsx>{`
        .social-proof-toast {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 9998;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          width: max-content;
          max-width: 300px;
          animation: slideInLeft 0.4s ease;
          border: 1px solid #e1e3e5;
          cursor: pointer;
        }
        .social-proof-toast--top {
          bottom: auto;
          top: 90px;
        }
        .social-proof-toast__icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-color, #00badb);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .social-proof-toast__body {
          min-width: 0;
          flex: 1;
        }
        .social-proof-toast__line1 {
          font-size: 13px;
          color: #202223;
          line-height: 1.4;
        }
        .social-proof-toast__product {
          font-size: 12px;
          color: var(--accent-color, #00badb);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .social-proof-toast__time {
          font-size: 11px;
          color: #8c9196;
          margin-top: 2px;
        }
        .social-proof-toast__close {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: #8c9196;
          font-size: 18px;
          line-height: 1;
          padding: 0 0 0 4px;
          align-self: flex-start;
        }
        @media (max-width: 640px) {
          .social-proof-toast {
            left: 8px;
            right: auto;
            bottom: 70px;
            max-width: calc(100vw - 16px);
            width: max-content;
            padding: 8px 10px;
            gap: 8px;
            border-radius: 10px;
            font-size: 12px;
          }
          .social-proof-toast--top {
            top: 60px;
            bottom: auto;
          }
          .social-proof-toast__icon {
            width: 30px;
            height: 30px;
            font-size: 14px;
          }
          .social-proof-toast__line1 {
            font-size: 11px;
          }
          .social-proof-toast__product {
            font-size: 10px;
          }
          .social-proof-toast__time {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
