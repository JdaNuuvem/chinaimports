import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("id");
  if (!orderId) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

  try {
    // Fetch order from backend
    const res = await fetch(`${backendUrl}/admin/orders`);
    const data = await res.json();
    const order = data.orders?.find((o: { id: string; displayId: number }) =>
      o.id === orderId || String(o.displayId) === orderId
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const address = order.shippingAddress ? JSON.parse(order.shippingAddress) : null;

    // Generate HTML invoice
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Pedido #${order.displayId}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e2d7d; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 900; color: #1e2d7d; }
    .invoice-title { font-size: 14px; color: #666; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box h3 { font-size: 12px; text-transform: uppercase; color: #888; margin: 0 0 8px; letter-spacing: 1px; }
    .info-box p { margin: 2px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .total-row td { font-weight: 700; border-top: 2px solid #1e2d7d; font-size: 16px; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-confirmed { background: #dcfce7; color: #16a34a; }
    .status-pending { background: #fef3c7; color: #d97706; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">IMPORTS CHINA BRASIL</div>
      <div class="invoice-title">Loja de Importados</div>
    </div>
    <div style="text-align: right">
      <div style="font-size: 20px; font-weight: 700">PEDIDO #${order.displayId}</div>
      <div style="font-size: 13px; color: #666">${new Date(order.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</div>
      <span class="status status-${order.status}">${order.status === "confirmed" ? "Confirmado" : order.status === "pending" ? "Pendente" : order.status}</span>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Endereço de entrega</h3>
      ${address ? `
        <p>${address.first_name} ${address.last_name}</p>
        <p>${address.address_1}${address.address_2 ? `, ${address.address_2}` : ""}</p>
        <p>${address.city}, ${address.province} — ${address.postal_code}</p>
        <p>${address.phone || ""}</p>
      ` : "<p>Não informado</p>"}
    </div>
    <div class="info-box">
      <h3>Informações do pedido</h3>
      <p><strong>Método de pagamento:</strong> ${order.paymentStatus === "captured" ? "Aprovado" : "Pendente"}</p>
      <p><strong>Status do envio:</strong> ${order.fulfillmentStatus === "fulfilled" ? "Entregue" : order.fulfillmentStatus === "shipped" ? "Enviado" : "Aguardando"}</p>
      ${order.customer ? `<p><strong>Cliente:</strong> ${order.customer.email}</p>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Produto</th>
        <th style="text-align:center">Qtd</th>
        <th style="text-align:right">Preço unit.</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || []).map((item: { title: string; quantity: number; unitPrice: number; total: number }) => `
        <tr>
          <td>${item.title}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">R$ ${(item.unitPrice / 100).toFixed(2).replace(".", ",")}</td>
          <td style="text-align:right">R$ ${(item.total / 100).toFixed(2).replace(".", ",")}</td>
        </tr>
      `).join("")}
      <tr>
        <td colspan="3" style="text-align:right">Subtotal</td>
        <td style="text-align:right">R$ ${(order.subtotal / 100).toFixed(2).replace(".", ",")}</td>
      </tr>
      <tr>
        <td colspan="3" style="text-align:right">Frete</td>
        <td style="text-align:right">${order.shippingTotal === 0 ? "Grátis" : `R$ ${(order.shippingTotal / 100).toFixed(2).replace(".", ",")}`}</td>
      </tr>
      ${order.discountTotal > 0 ? `
        <tr>
          <td colspan="3" style="text-align:right; color:#16a34a">Desconto</td>
          <td style="text-align:right; color:#16a34a">-R$ ${(order.discountTotal / 100).toFixed(2).replace(".", ",")}</td>
        </tr>
      ` : ""}
      <tr class="total-row">
        <td colspan="3" style="text-align:right">TOTAL</td>
        <td style="text-align:right">R$ ${(order.total / 100).toFixed(2).replace(".", ",")}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Imports China Brasil · Todos os direitos reservados</p>
    <p>Este documento não possui valor fiscal. Para nota fiscal, consulte seu e-mail.</p>
  </div>

  <div class="no-print" style="text-align:center; margin-top:20px">
    <button onclick="window.print()" style="padding:12px 32px; background:#1e2d7d; color:#fff; border:none; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer">
      Imprimir / Salvar PDF
    </button>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
