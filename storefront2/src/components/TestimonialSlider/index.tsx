"use client";

import { useState, useEffect } from "react";

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar?: string;
}

interface TestimonialSliderProps {
  testimonials?: Testimonial[];
  autoPlayInterval?: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { name: "Maria Silva", location: "São Paulo, SP", text: "Melhor loja de esportes! Entrega super rápida e qualidade incrível.", rating: 5 },
  { name: "João Santos", location: "Rio de Janeiro, RJ", text: "Compro sempre aqui. Preços justos e atendimento excelente.", rating: 5 },
  { name: "Ana Costa", location: "Belo Horizonte, MG", text: "A camiseta UA Tech é perfeita para treino. Vou comprar mais!", rating: 5 },
  { name: "Pedro Oliveira", location: "Curitiba, PR", text: "Frete grátis e chegou antes do prazo. Recomendo!", rating: 4 },
];

export default function TestimonialSlider({ testimonials = DEFAULT_TESTIMONIALS, autoPlayInterval = 5000 }: TestimonialSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [testimonials.length, autoPlayInterval]);

  const t = testimonials[current];

  return (
    <div style={{
      maxWidth: 600, margin: "0 auto",
      padding: "32px 24px",
      textAlign: "center",
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#202223" }}>
        O que nossos clientes dizem
      </h3>

      <div style={{
        background: "#fff", borderRadius: 12,
        padding: "24px", border: "1px solid #e5e7eb",
        minHeight: 120,
        transition: "opacity 0.3s",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 12 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} style={{ fontSize: 18, color: s <= t.rating ? "#f59e0b" : "#e5e7eb" }}>★</span>
          ))}
        </div>

        <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.6, margin: "0 0 16px", fontStyle: "italic" }}>
          &ldquo;{t.text}&rdquo;
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "#1e2d7d", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14,
          }}>
            {t.name.charAt(0)}
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.location}</div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 24 : 8,
              height: 8, borderRadius: 4,
              background: i === current ? "#1e2d7d" : "#d1d5db",
              border: "none", cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
