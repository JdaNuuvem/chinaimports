"use client";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  title?: string;
}

export default function FaqAccordion({ items, title = "Perguntas Frequentes" }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-section section">
      <div className="container">
        <h2 className="section__title heading h3" style={{ marginBottom: 30, textAlign: "center" }}>
          {title}
        </h2>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                borderBottom: "1px solid var(--border-color)",
                marginBottom: 0,
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  padding: "18px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--heading-color)",
                  textAlign: "left",
                }}
              >
                <span>{item.question}</span>
                <span style={{ fontSize: 20, transition: "transform 0.2s", transform: openIndex === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {openIndex === i && (
                <div
                  className="rte"
                  style={{
                    padding: "0 0 18px",
                    lineHeight: 1.7,
                    color: "var(--text-color)",
                    fontSize: 15,
                  }}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
