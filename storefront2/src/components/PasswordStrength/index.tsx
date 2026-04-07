"use client";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Fraca", color: "#dc2626" };
  if (score <= 3) return { score, label: "Razoável", color: "#f59e0b" };
  if (score <= 4) return { score, label: "Boa", color: "#3b82f6" };
  return { score, label: "Forte", color: "#16a34a" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getStrength(password);
  const maxScore = 6;
  const percentage = (score / maxScore) * 100;

  return (
    <div style={{ marginTop: 4, marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= score ? color : "#e5e7eb",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>
          {password.length < 8 && "Mínimo 8 caracteres"}
          {password.length >= 8 && score < 4 && "Adicione números e símbolos"}
          {score >= 4 && "Excelente!"}
        </span>
      </div>
    </div>
  );
}
