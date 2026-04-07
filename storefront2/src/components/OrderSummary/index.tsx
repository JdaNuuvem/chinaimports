import { formatMoney } from "@/lib/utils";

interface OrderSummaryItem {
  title: string;
  quantity: number;
  price: number;
  thumbnail?: string | null;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string;
}

export default function OrderSummary({ items, subtotal, shipping, discount, total, couponCode }: OrderSummaryProps) {
  return (
    <div style={{
      background: "#f9fafb", borderRadius: 12,
      padding: 20, border: "1px solid #e5e7eb",
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, margin: 0 }}>Resumo do pedido</h3>

      {/* Items */}
      <div style={{ marginBottom: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 0",
            borderBottom: i < items.length - 1 ? "1px solid #e5e7eb" : "none",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 6,
              background: "#e5e7eb", overflow: "hidden", flexShrink: 0,
            }}>
              {item.thumbnail ? (
                <img src={item.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Qtd: {item.quantity}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {formatMoney(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ fontSize: 13, color: "#6b7280" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span>Frete</span>
          <span style={{ color: shipping === 0 ? "#16a34a" : undefined, fontWeight: shipping === 0 ? 600 : 400 }}>
            {shipping === 0 ? "Grátis" : formatMoney(shipping)}
          </span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "#16a34a" }}>
            <span>Desconto {couponCode && <span style={{ fontFamily: "monospace", fontSize: 11 }}>({couponCode})</span>}</span>
            <span>-{formatMoney(discount)}</span>
          </div>
        )}
      </div>

      <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--primary-color, #1e2d7d)" }}>
          {formatMoney(total)}
        </span>
      </div>
    </div>
  );
}
