"use client";

import React from "react";

export function Section({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e1e3e5", padding: "24px", marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#202223", marginBottom: description ? 4 : 16 }}>{title}</h2>
      {description && <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 16 }}>{description}</p>}
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// NEW COMPONENTS — Trampofy-inspired layout primitives
// ════════════════════════════════════════════════════════════

/**
 * Consistent page header: title + subtitle on left, actions slot on right.
 * Used at the top of every admin tab.
 */
export function PageHeader({
  title, subtitle, actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      marginBottom: 24,
      paddingBottom: 20,
      borderBottom: "1px solid #e1e3e5",
      flexWrap: "wrap",
    }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#202223", margin: 0, lineHeight: 1.15 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: "#6d7175", margin: "4px 0 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * KPI / metric card — title, big value, optional trend % and icon.
 */
export function KpiCard({
  label, value, trend, trendDirection, icon, subLabel,
}: {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  subLabel?: string;
}) {
  const trendColor =
    trendDirection === "up" ? "#16a34a" :
    trendDirection === "down" ? "#dc2626" :
    "#6d7175";
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e1e3e5",
      borderRadius: 12,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#6d7175", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </span>
        {icon && <span style={{ color: "#9ca3af" }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#202223", lineHeight: 1.1 }}>
        {value}
      </div>
      {(trend || subLabel) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          {trend && (
            <span style={{ fontWeight: 700, color: trendColor }}>
              {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : ""} {trend}
            </span>
          )}
          {subLabel && <span style={{ color: "#9ca3af" }}>{subLabel}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * Status badge with color coding for pedido/pagamento/fulfillment states.
 */
export type StatusVariant = "pending" | "success" | "completed" | "failed" | "info" | "warning" | "neutral";

const STATUS_COLORS: Record<StatusVariant, { bg: string; border: string; text: string }> = {
  pending: { bg: "#fef3c7", border: "#fde68a", text: "#92400e" },
  success: { bg: "#dcfce7", border: "#bbf7d0", text: "#166534" },
  completed: { bg: "#dbeafe", border: "#bfdbfe", text: "#1e40af" },
  failed: { bg: "#fee2e2", border: "#fecaca", text: "#991b1b" },
  info: { bg: "#e0f2fe", border: "#bae6fd", text: "#075985" },
  warning: { bg: "#fed7aa", border: "#fdba74", text: "#9a3412" },
  neutral: { bg: "#f3f4f6", border: "#e5e7eb", text: "#374151" },
};

export function StatusBadge({ label, variant = "neutral" }: { label: string; variant?: StatusVariant }) {
  const c = STATUS_COLORS[variant];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 12,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.text,
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.3,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

/**
 * Filters toolbar — search + dropdowns row above tables.
 */
export function FiltersBar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex",
      gap: 10,
      alignItems: "center",
      padding: "12px 16px",
      background: "#fff",
      border: "1px solid #e1e3e5",
      borderRadius: 10,
      marginBottom: 16,
      flexWrap: "wrap",
    }}>
      {children}
    </div>
  );
}

/**
 * Action button — primary/secondary/danger styles for page header slots.
 */
export function ActionButton({
  children, onClick, variant = "secondary", icon, disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "#00badb", color: "#fff", border: "1px solid #00badb" },
    secondary: { background: "#fff", color: "#374151", border: "1px solid #d1d5db" },
    danger: { background: "#fff", color: "#dc2626", border: "1px solid #fca5a5" },
    success: { background: "#16a34a", color: "#fff", border: "1px solid #16a34a" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 0.15s, box-shadow 0.15s",
        ...styles[variant],
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * Integration card — shows a third-party service with status and configure button.
 */
export function IntegrationCard({
  name, description, status, icon, children,
}: {
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const statusConfig = {
    active: { label: "Ativo", variant: "success" as StatusVariant },
    inactive: { label: "Inativo", variant: "neutral" as StatusVariant },
    pending: { label: "Pendente", variant: "pending" as StatusVariant },
  };
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e1e3e5",
      borderRadius: 12,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {icon && (
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {icon}
            </div>
          )}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#202223", margin: 0 }}>{name}</h3>
        </div>
        <StatusBadge label={statusConfig[status].label} variant={statusConfig[status].variant} />
      </div>
      <p style={{ fontSize: 13, color: "#6d7175", margin: 0, lineHeight: 1.5 }}>{description}</p>
      {children && <div style={{ marginTop: 4 }}>{children}</div>}
    </div>
  );
}

/**
 * Sidebar nav badge — for "NEW", "ATIVO", "PRO" tags next to nav items.
 */
export function NavBadge({ label, variant = "info" }: { label: string; variant?: "info" | "success" | "warning" | "neutral" }) {
  const colors = {
    info: { bg: "#00badb", text: "#fff" },
    success: { bg: "#16a34a", text: "#fff" },
    warning: { bg: "#f59e0b", text: "#fff" },
    neutral: { bg: "rgba(255,255,255,0.15)", text: "rgba(255,255,255,0.85)" },
  };
  const c = colors[variant];
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: 10,
      background: c.bg,
      color: c.text,
      fontSize: 9,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginLeft: 6,
      verticalAlign: "middle",
    }}>
      {label}
    </span>
  );
}

/**
 * Pagination component — "Mostrando X-Y de Z" + per-page + prev/next.
 */
export function Pagination({
  currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 16px",
      background: "#fff",
      border: "1px solid #e1e3e5",
      borderTop: "none",
      borderRadius: "0 0 10px 10px",
      fontSize: 13,
      color: "#6d7175",
      flexWrap: "wrap",
      gap: 10,
    }}>
      <span>
        Mostrando <strong style={{ color: "#202223" }}>{start}-{end}</strong> de <strong style={{ color: "#202223" }}>{totalItems}</strong>
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{ padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, background: "#fff" }}
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        )}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, fontSize: 13 }}
        >
          Anterior
        </button>
        <span style={{ fontWeight: 600, color: "#202223" }}>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1, fontSize: 13 }}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

export const FONT_OPTIONS = [
  { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Helvetica Neue", category: "Sans-serif" },
  { value: "'Inter', sans-serif", label: "Inter", category: "Sans-serif" },
  { value: "'Roboto', sans-serif", label: "Roboto", category: "Sans-serif" },
  { value: "'Open Sans', sans-serif", label: "Open Sans", category: "Sans-serif" },
  { value: "'Lato', sans-serif", label: "Lato", category: "Sans-serif" },
  { value: "'Montserrat', sans-serif", label: "Montserrat", category: "Sans-serif" },
  { value: "'Poppins', sans-serif", label: "Poppins", category: "Sans-serif" },
  { value: "'Nunito Sans', sans-serif", label: "Nunito Sans", category: "Sans-serif" },
  { value: "'Source Sans Pro', sans-serif", label: "Source Sans Pro", category: "Sans-serif" },
  { value: "'DM Sans', sans-serif", label: "DM Sans", category: "Sans-serif" },
  { value: "'Work Sans', sans-serif", label: "Work Sans", category: "Sans-serif" },
  { value: "'Oswald', sans-serif", label: "Oswald", category: "Sans-serif" },
  { value: "'Raleway', sans-serif", label: "Raleway", category: "Sans-serif" },
  { value: "system-ui, -apple-system, sans-serif", label: "System UI", category: "Sistema" },
  { value: "'Playfair Display', serif", label: "Playfair Display", category: "Serif" },
  { value: "'Merriweather', serif", label: "Merriweather", category: "Serif" },
  { value: "'Lora', serif", label: "Lora", category: "Serif" },
  { value: "'PT Serif', serif", label: "PT Serif", category: "Serif" },
  { value: "Georgia, serif", label: "Georgia", category: "Serif" },
  { value: "'Fira Code', monospace", label: "Fira Code", category: "Monospace" },
];

export function FontPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const currentFont = FONT_OPTIONS.find((f) => f.value === value);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, fontFamily: value, appearance: "auto", outline: "none", background: "#fff", cursor: "pointer" }}
      >
        {["Sans-serif", "Serif", "Sistema", "Monospace"].map((cat) => {
          const fonts = FONT_OPTIONS.filter((f) => f.category === cat);
          if (fonts.length === 0) return null;
          return (
            <optgroup key={cat} label={cat}>
              {fonts.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      <p style={{ fontSize: 12, color: "#6d7175", marginTop: 4 }}>
        Atual: <span style={{ fontFamily: value, fontWeight: 600 }}>{currentFont?.label || value.split(",")[0].replace(/'/g, "")}</span>
      </p>
    </div>
  );
}

export function ColorGroup({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e2d7d", marginBottom: 2 }}>{title}</h3>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{description}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, helpText }: { label: string; value: string; onChange: (v: string) => void; helpText?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, outline: "none", transition: "border 0.15s" }}
        onFocus={(e) => e.target.style.borderColor = "#005bd3"}
        onBlur={(e) => e.target.style.borderColor = "#c9cccf"}
      />
      {helpText && <p style={{ fontSize: 12, color: "#6d7175", marginTop: 4 }}>{helpText}</p>}
    </div>
  );
}

export function TextAreaField({ label, value, onChange, helpText }: { label: string; value: string; onChange: (v: string) => void; helpText?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, resize: "vertical", outline: "none", transition: "border 0.15s" }}
        onFocus={(e) => e.target.style.borderColor = "#005bd3"}
        onBlur={(e) => e.target.style.borderColor = "#c9cccf"}
      />
      {helpText && <p style={{ fontSize: 12, color: "#6d7175", marginTop: 4 }}>{helpText}</p>}
    </div>
  );
}

export function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 120, padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14 }}
      />
    </div>
  );
}

const GRADIENT_PRESETS = [
  { label: "Laranja → Vermelho", value: "linear-gradient(135deg, #f97316, #dc2626)" },
  { label: "Azul → Roxo", value: "linear-gradient(135deg, #3b82f6, #7c3aed)" },
  { label: "Verde → Azul", value: "linear-gradient(135deg, #16a34a, #0ea5e9)" },
  { label: "Rosa → Roxo", value: "linear-gradient(135deg, #A53954, #8b5cf6)" },
  { label: "Dourado → Laranja", value: "linear-gradient(135deg, #f59e0b, #f97316)" },
  { label: "Preto → Cinza", value: "linear-gradient(135deg, #1a1a2e, #374151)" },
  { label: "Azul Escuro", value: "linear-gradient(135deg, #1e2d7d, #0d1847)" },
  { label: "Verde Esmeralda", value: "linear-gradient(135deg, #059669, #0d9488)" },
];

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const isGradient = value.includes("gradient");
  const [mode, setMode] = React.useState<"solid" | "gradient">(isGradient ? "gradient" : "solid");
  const [localValue, setLocalValue] = React.useState(value);
  const [color1, setColor1] = React.useState(() => {
    if (!isGradient) return value;
    const match = value.match(/#[a-fA-F0-9]{6}/g);
    return match?.[0] || "#000000";
  });
  const [color2, setColor2] = React.useState(() => {
    if (!isGradient) return "#000000";
    const match = value.match(/#[a-fA-F0-9]{6}/g);
    return match?.[1] || "#333333";
  });
  const [angle, setAngle] = React.useState(135);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from parent when value changes externally
  React.useEffect(() => { setLocalValue(value); }, [value]);

  const debouncedOnChange = React.useCallback((v: string) => {
    setLocalValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(v), 300);
  }, [onChange]);

  // Cleanup on unmount
  React.useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const buildGradient = (c1: string, c2: string, a: number) => `linear-gradient(${a}deg, ${c1}, ${c2})`;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{label}</label>
        <div style={{ display: "flex", gap: 2, background: "#f0f0f0", borderRadius: 4, padding: 1 }}>
          <button onClick={() => { setMode("solid"); if (mode === "gradient") onChange(color1); }} style={{ padding: "2px 8px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, background: mode === "solid" ? "#fff" : "transparent", color: mode === "solid" ? "#202223" : "#888", boxShadow: mode === "solid" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}>
            Sólido
          </button>
          <button onClick={() => { setMode("gradient"); onChange(buildGradient(color1, color2, angle)); }} style={{ padding: "2px 8px", borderRadius: 3, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 600, background: mode === "gradient" ? "#fff" : "transparent", color: mode === "gradient" ? "#202223" : "#888", boxShadow: mode === "gradient" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}>
            Gradiente
          </button>
        </div>
      </div>

      {mode === "solid" ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={localValue.startsWith("#") ? localValue : "#000000"} onChange={(e) => debouncedOnChange(e.target.value)} style={{ width: 40, height: 40, border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", padding: 2 }} />
          <input type="text" value={localValue} onChange={(e) => debouncedOnChange(e.target.value)} onBlur={() => onChange(localValue)} style={{ width: 100, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }} />
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: localValue, border: "1px solid #ddd" }} />
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Cor 1</div>
              <input type="color" value={color1} onChange={(e) => { setColor1(e.target.value); debouncedOnChange(buildGradient(e.target.value, color2, angle)); }} style={{ width: 36, height: 36, border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", padding: 1 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Cor 2</div>
              <input type="color" value={color2} onChange={(e) => { setColor2(e.target.value); debouncedOnChange(buildGradient(color1, e.target.value, angle)); }} style={{ width: 36, height: 36, border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", padding: 1 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Ângulo: {angle}°</div>
              <input type="range" min="0" max="360" value={angle} onChange={(e) => { const a = Number(e.target.value); setAngle(a); debouncedOnChange(buildGradient(color1, color2, a)); }} style={{ width: "100%" }} />
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: localValue, border: "1px solid #ddd", flexShrink: 0 }} />
          </div>
          {/* Gradient presets */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                title={preset.label}
                onClick={() => {
                  onChange(preset.value);
                  const match = preset.value.match(/#[a-fA-F0-9]{6}/g);
                  if (match) { setColor1(match[0]); setColor2(match[1]); }
                  const angleMatch = preset.value.match(/(\d+)deg/);
                  if (angleMatch) setAngle(Number(angleMatch[1]));
                }}
                style={{ width: 28, height: 28, borderRadius: 6, background: preset.value, border: "1px solid #ddd", cursor: "pointer", padding: 0 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label style={{ fontSize: 14 }}>{label}</label>
    </div>
  );
}

export function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14 }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e1e3e5" }}>
      <button
        onClick={onClick}
        disabled={saving}
        style={{
          padding: "10px 24px",
          background: saving ? "#8c9196" : "#008060", color: "#fff",
          border: "none", borderRadius: 8, cursor: saving ? "default" : "pointer",
          fontWeight: 600, fontSize: 13, transition: "background 0.15s",
        }}
      >
        {saving ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}
