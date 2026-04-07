import { formatMoney } from "@/lib/utils";
import { getThemeConfig } from "@/lib/theme-config";

interface InstallmentDisplayProps {
  price: number;
  maxInstallments?: number;
  compact?: boolean;
}

export default function InstallmentDisplay({ price, maxInstallments = 10, compact = false }: InstallmentDisplayProps) {
  const config = getThemeConfig();
  const interestRate = config.installments.percentage / 10000;

  if (price <= 0) return null;

  // Find best installment (no interest up to maxInstallments)
  const installmentValue = Math.ceil(price / maxInstallments);
  const minInstallment = 1000; // R$ 10,00 minimum

  let bestCount = 1;
  for (let i = maxInstallments; i >= 2; i--) {
    if (Math.ceil(price / i) >= minInstallment) {
      bestCount = i;
      break;
    }
  }

  const perInstallment = Math.ceil(price / bestCount);

  if (bestCount <= 1) return null;

  if (compact) {
    return (
      <span style={{ fontSize: 12, color: "var(--success-color, #00a500)" }}>
        {bestCount}x de {formatMoney(perInstallment)}
      </span>
    );
  }

  return (
    <div style={{ fontSize: 13, color: "var(--text-color)", marginTop: 4 }}>
      <span style={{ color: "var(--success-color, #00a500)", fontWeight: 600 }}>
        {bestCount}x de {formatMoney(perInstallment)} sem juros
      </span>
    </div>
  );
}
