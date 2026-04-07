"use client";

const STEPS = [
  { key: "address", label: "Endereço", icon: "📍" },
  { key: "shipping", label: "Entrega", icon: "🚚" },
  { key: "payment", label: "Pagamento", icon: "💳" },
];

interface CheckoutStepsProps {
  currentStep: string;
  onStepClick?: (step: string) => void;
}

export default function CheckoutSteps({ currentStep, onStepClick }: CheckoutStepsProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
        {STEPS.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => isClickable && onStepClick(step.key)}
                disabled={!isClickable}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  border: "none", background: "none",
                  cursor: isClickable ? "pointer" : "default",
                  opacity: isActive || isCompleted ? 1 : 0.4,
                  padding: "0 8px",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                  background: isCompleted ? "#16a34a" : isActive ? "var(--primary-color, #1e2d7d)" : "#e5e7eb",
                  color: isCompleted || isActive ? "#fff" : "#9ca3af",
                  fontWeight: 700,
                  transition: "all 0.3s",
                }}>
                  {isCompleted ? "✓" : step.icon}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 700 : 400,
                  color: isActive ? "var(--primary-color, #1e2d7d)" : isCompleted ? "#16a34a" : "#9ca3af",
                }}>
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div style={{
                  width: 60, height: 2,
                  background: index < currentIndex ? "#16a34a" : "#e5e7eb",
                  transition: "background 0.3s",
                  marginBottom: 18,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
