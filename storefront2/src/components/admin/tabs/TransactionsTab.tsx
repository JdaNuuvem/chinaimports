"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader, KpiCard, StatusBadge, FiltersBar, ActionButton, Pagination, type StatusVariant } from "./shared";

interface Transaction {
  id: string;
  displayId: number;
  total: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  customerEmail?: string;
  customerName?: string;
  paymentMethod?: string;
  gateway?: string;
}

interface TransactionsTabProps {
  backendUrl: string;
  token?: string;
}

export default function TransactionsTab({ backendUrl, token }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const authHeaders: HeadersInit = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };

  const load = useCallback(() => {
    setLoading(true);
    fetch(`${backendUrl}/admin/orders`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => {
        // Transform orders into transactions view (flat, payment-focused)
        const txs: Transaction[] = (d.orders || []).map((o: Record<string, unknown>) => ({
          id: o.id as string,
          displayId: o.displayId as number,
          total: o.total as number,
          paymentStatus: (o.paymentStatus as string) || "awaiting",
          status: o.status as string,
          createdAt: o.createdAt as string,
          customerEmail: (o.customer as { email?: string })?.email || (o.email as string),
          customerName: (o.customer as { firstName?: string; lastName?: string })
            ? `${(o.customer as { firstName?: string }).firstName || ""} ${(o.customer as { lastName?: string }).lastName || ""}`.trim()
            : undefined,
          paymentMethod: (o.paymentMethod as string) || "PIX",
          gateway: (o.gateway as string) || "lunacheckout",
        }));
        setTransactions(txs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, token]);

  useEffect(() => { load(); }, [load]);

  const formatBRL = (v: number) => `R$ ${(v / 100).toFixed(2).replace(".", ",")}`;

  // Filter
  const filtered = transactions.filter((t) => {
    if (search && !String(t.displayId).includes(search) && !(t.customerEmail?.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter && t.paymentStatus !== statusFilter) return false;
    if (methodFilter && t.paymentMethod !== methodFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Totals
  const totalPaid = transactions.filter((t) => t.paymentStatus === "paid" || t.paymentStatus === "captured").reduce((sum, t) => sum + t.total, 0);
  const totalPending = transactions.filter((t) => t.paymentStatus === "awaiting" || t.paymentStatus === "pending").reduce((sum, t) => sum + t.total, 0);

  const statusBadge = (status: string): { label: string; variant: StatusVariant } => {
    const map: Record<string, { label: string; variant: StatusVariant }> = {
      paid: { label: "Pago", variant: "success" },
      captured: { label: "Pago", variant: "success" },
      awaiting: { label: "Aguardando", variant: "pending" },
      pending: { label: "Pendente", variant: "pending" },
      refunded: { label: "Reembolsado", variant: "warning" },
      canceled: { label: "Cancelado", variant: "failed" },
      failed: { label: "Falhou", variant: "failed" },
      completed: { label: "Completo", variant: "completed" },
    };
    return map[status] || { label: status, variant: "neutral" };
  };

  return (
    <div>
      <PageHeader
        title="Transações"
        subtitle="Acompanhe todas as transações financeiras"
        actions={<ActionButton variant="secondary">Exportar CSV</ActionButton>}
      />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <KpiCard label="Total de transações" value={transactions.length} />
        <KpiCard label="Valor pago" value={formatBRL(totalPaid)} trendDirection="up" subLabel="confirmado" />
        <KpiCard label="Aguardando pagamento" value={formatBRL(totalPending)} subLabel="pendente" />
      </div>

      {/* Filters */}
      <FiltersBar>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="🔍 Buscar por ID ou e-mail"
          style={{ flex: 1, minWidth: 220, padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#fff" }}
        >
          <option value="">Status: Todos</option>
          <option value="paid">Pago</option>
          <option value="awaiting">Aguardando</option>
          <option value="pending">Pendente</option>
          <option value="refunded">Reembolsado</option>
          <option value="failed">Falhou</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
          style={{ padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#fff" }}
        >
          <option value="">Método: Todos</option>
          <option value="PIX">PIX</option>
          <option value="credit_card">Cartão de Crédito</option>
          <option value="boleto">Boleto</option>
        </select>
      </FiltersBar>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Carregando...</div>
      ) : paginated.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "#9ca3af", background: "#fff", border: "1px solid #e1e3e5", borderRadius: 10 }}>
          Nenhuma transação encontrada
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: "10px 10px 0 0", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e1e3e5" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>ID</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Pedido</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Cliente</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Método</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Gateway</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Data</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => {
                  const sb = statusBadge(t.paymentStatus);
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "#9ca3af" }}>
                        {t.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#00badb" }}>
                        #{t.displayId}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "#202223" }}>{t.customerName || "—"}</div>
                        {t.customerEmail && <div style={{ fontSize: 11, color: "#6b7280" }}>{t.customerEmail}</div>}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>{t.paymentMethod}</td>
                      <td style={{ padding: "12px 16px", color: "#6b7280", fontSize: 11 }}>{t.gateway}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge label={sb.label} variant={sb.variant} />
                      </td>
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                        {new Date(t.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                        <div style={{ fontSize: 10, color: "#9ca3af" }}>
                          {new Date(t.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "#202223" }}>
                        {formatBRL(t.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
