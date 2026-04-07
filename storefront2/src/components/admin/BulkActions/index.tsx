"use client";

import { useState } from "react";

interface BulkActionsProps {
  selectedIds: string[];
  onAction: (action: string, ids: string[]) => Promise<void>;
  entityName: string;
}

export default function BulkActions({ selectedIds, onAction, entityName }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");

  if (selectedIds.length === 0) return null;

  const handleExecute = async () => {
    if (!action) return;
    if (action === "delete" && !confirm(`Tem certeza que deseja excluir ${selectedIds.length} ${entityName}?`)) return;

    setLoading(true);
    await onAction(action, selectedIds);
    setLoading(false);
    setAction("");
  };

  return (
    <div style={{
      position: "sticky", bottom: 0,
      background: "#fff", borderTop: "2px solid #1e2d7d",
      padding: "12px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
      zIndex: 10,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {selectedIds.length} {entityName} selecionado{selectedIds.length > 1 ? "s" : ""}
      </span>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, background: "#fff" }}
        >
          <option value="">Ação em massa...</option>
          <option value="activate">Ativar</option>
          <option value="deactivate">Desativar</option>
          <option value="feature">Marcar como destaque</option>
          <option value="unfeature">Remover destaque</option>
          <option value="delete">Excluir</option>
        </select>

        <button
          onClick={handleExecute}
          disabled={!action || loading}
          style={{
            padding: "8px 16px", borderRadius: 6,
            background: action === "delete" ? "#dc2626" : "#1e2d7d",
            color: "#fff", border: "none",
            fontWeight: 600, fontSize: 13,
            cursor: !action || loading ? "not-allowed" : "pointer",
            opacity: !action ? 0.5 : 1,
          }}
        >
          {loading ? "Executando..." : "Aplicar"}
        </button>
      </div>
    </div>
  );
}

export function BulkSelectCheckbox({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      ref={(el) => { if (el) el.indeterminate = !!indeterminate; }}
      style={{ width: 16, height: 16, cursor: "pointer" }}
    />
  );
}
