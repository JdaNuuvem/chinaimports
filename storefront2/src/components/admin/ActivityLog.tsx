"use client";
import { useState, useEffect } from "react";

interface LogEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ua_admin_log") || "[]");
      setLogs(saved.slice(0, 50));
    } catch {}
  }, []);

  if (logs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#6d7175", fontSize: 13 }}>
        Nenhuma atividade registrada ainda
      </div>
    );
  }

  return (
    <div style={{ maxHeight: 300, overflowY: "auto" }}>
      {logs.map((log) => (
        <div key={log.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f1f1", fontSize: 12 }}>
          <div style={{ color: "#6d7175", whiteSpace: "nowrap", minWidth: 60 }}>
            {new Date(log.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#202223" }}>{log.action}</span>
            <span style={{ color: "#6d7175" }}> — {log.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to add log entries from anywhere
export function addAdminLog(action: string, detail: string) {
  try {
    const logs = JSON.parse(localStorage.getItem("ua_admin_log") || "[]");
    logs.unshift({ id: Date.now().toString(), action, detail, timestamp: new Date().toISOString() });
    localStorage.setItem("ua_admin_log", JSON.stringify(logs.slice(0, 100)));
  } catch {}
}
