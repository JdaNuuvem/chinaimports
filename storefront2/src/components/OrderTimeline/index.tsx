interface TimelineEvent {
  status: string;
  label: string;
  date?: string;
  description?: string;
  icon: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "in_transit", "out_for_delivery", "delivered"];

export default function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div style={{ padding: "16px 0" }}>
      {events.map((event, index) => {
        const isCompleted = STATUS_ORDER.indexOf(event.status) <= currentIdx;
        const isCurrent = event.status === currentStatus;
        const isLast = index === events.length - 1;

        return (
          <div key={event.status} style={{ display: "flex", gap: 16 }}>
            {/* Timeline track */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
                background: isCurrent ? "var(--primary-color, #1e2d7d)" : isCompleted ? "#16a34a" : "#e5e7eb",
                color: isCompleted || isCurrent ? "#fff" : "#9ca3af",
                fontWeight: 700,
                boxShadow: isCurrent ? "0 0 0 4px rgba(30,45,125,0.2)" : "none",
                transition: "all 0.3s",
              }}>
                {isCompleted && !isCurrent ? "✓" : event.icon}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 40,
                  background: isCompleted ? "#16a34a" : "#e5e7eb",
                  transition: "background 0.3s",
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
              <div style={{
                fontWeight: isCurrent ? 700 : 500,
                fontSize: 14,
                color: isCompleted || isCurrent ? "#202223" : "#9ca3af",
              }}>
                {event.label}
              </div>
              {event.date && (
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {new Date(event.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
              {event.description && (
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 1.4 }}>
                  {event.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function getDefaultEvents(status: string): TimelineEvent[] {
  return [
    { status: "pending", label: "Pedido recebido", icon: "📋", description: "Seu pedido foi registrado no sistema" },
    { status: "confirmed", label: "Pagamento confirmado", icon: "✓", description: "O pagamento foi aprovado" },
    { status: "processing", label: "Em preparação", icon: "📦", description: "Estamos separando seus itens" },
    { status: "shipped", label: "Enviado", icon: "🚚", description: "O pedido saiu para entrega" },
    { status: "in_transit", label: "Em trânsito", icon: "📍", description: "O pedido está a caminho" },
    { status: "out_for_delivery", label: "Saiu para entrega", icon: "🏠", description: "O entregador está a caminho" },
    { status: "delivered", label: "Entregue", icon: "✅", description: "O pedido foi entregue com sucesso!" },
  ];
}
