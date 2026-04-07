"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";
import { getThemeConfig } from "@/lib/theme-config";
import Link from "next/link";
import {
  updateCartAddress,
  getShippingOptions,
  selectShippingMethod,
  createPaymentSessions,
  completeCart,
} from "@/lib/medusa-client";
import { fetchAddressByCep, formatCep } from "@/lib/viacep";
import CheckoutSteps from "@/components/CheckoutSteps";
import SecureCheckoutBadges from "@/components/SecureCheckoutBadges";
import { trackBeginCheckout, trackPurchase } from "@/lib/sentinel";

type Step = "address" | "shipping" | "payment" | "confirmation";

interface ShippingOption {
  id: string;
  name: string;
  amount: number;
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const config = getThemeConfig();
  const [step, setStep] = useState<Step>("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [orderData, setOrderData] = useState<Record<string, unknown> | null>(null);

  // Luna Checkout redirect
  const lunaConfig = (config as unknown as Record<string, unknown>).checkout as { provider?: string; lunaCheckoutUrl?: string } | undefined;
  useEffect(() => {
    if (lunaConfig?.provider === "luna" && lunaConfig.lunaCheckoutUrl && lunaConfig.lunaCheckoutUrl !== "https://sua-loja.lunacheckout.com") {
      // Build Luna checkout URL with cart items as query params
      const lunaUrl = lunaConfig.lunaCheckoutUrl;
      window.location.href = lunaUrl;
    }
  }, [lunaConfig]);

  // Sentinel begin_checkout — once per cart visit
  useEffect(() => {
    if (cart && cart.items.length > 0) {
      trackBeginCheckout({
        id: cart.id,
        total: cart.total,
        items: cart.items.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.unit_price,
          quantity: i.quantity,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.id]);

  // Address form
  const [address, setAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    address_2: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "BR",
    phone: "",
  });

  const [cepLoading, setCepLoading] = useState(false);

  const updateAddr = (field: string, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    updateAddr("postal_code", formatted);
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      setCepLoading(true);
      const data = await fetchAddressByCep(clean);
      if (data) {
        setAddress((prev) => ({
          ...prev,
          postal_code: formatted,
          address_1: data.logradouro || prev.address_1,
          address_2: data.complemento || prev.address_2,
          city: data.localidade || prev.city,
          province: data.uf || prev.province,
        }));
      }
      setCepLoading(false);
    }
  };

  if (!cart) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 className="heading h2">Seu carrinho está vazio</h1>
        <Link href="/collections/all" className="button button--primary" style={{ marginTop: 20, display: "inline-block" }}>
          Continuar comprando
        </Link>
      </div>
    );
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await updateCartAddress(cart.id, address);
      if (!result.data) {
        setError("Erro ao salvar endereço. Tente novamente.");
        return;
      }
      const shippingResult = await getShippingOptions(cart.id);
      setShippingOptions((shippingResult.data?.shipping_options ?? []) as ShippingOption[]);
      setStep("shipping");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingSelect = async (optionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await selectShippingMethod(cart.id, optionId);
      if (!result.data) {
        setError("Erro ao selecionar frete.");
        return;
      }
      await createPaymentSessions(cart.id);
      setStep("payment");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await completeCart(cart.id);
      if (result.data) {
        setOrderData(result.data.data);
        localStorage.removeItem("cart_id");
        // Sentinel purchase event — fire BEFORE redirect so it lands
        const orderInfo = result.data.data as Record<string, unknown>;
        const orderId = (orderInfo?.id as string) || "";
        trackPurchase({
          id: orderId,
          total: cart.total,
          email: (cart as { email?: string }).email,
          items: cart.items.map((i) => ({
            id: i.id,
            title: i.title,
            price: i.unit_price,
            quantity: i.quantity,
          })),
        });
        // Redirect to order confirmation page
        window.location.href = `/order-confirmation?order=${orderId}`;
        return;
      } else {
        setError("Erro ao finalizar pedido.");
      }
    } catch {
      setError("Erro de conexão ao finalizar.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { width: "100%", padding: "10px 14px", border: "1px solid var(--border-color)", borderRadius: 4, fontSize: 14, marginBottom: 12 };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600 as const, marginBottom: 4 };

  return (
    <div className="container" style={{ maxWidth: 700, padding: "40px 20px" }}>
      <h1 className="heading h2" style={{ marginBottom: 30 }}>Finalizar Compra</h1>

      {/* Progress indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 30 }}>
        {(["address", "shipping", "payment", "confirmation"] as Step[]).map((s, i) => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: (["address", "shipping", "payment", "confirmation"].indexOf(step) >= i) ? "var(--accent-color)" : "var(--border-color)",
          }} />
        ))}
      </div>

      {error && (
        <div className="alert alert--error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      <CheckoutSteps currentStep={step} onStepClick={(s) => setStep(s as Step)} />

      {/* Step 1: Address */}
      {step === "address" && (
        <form onSubmit={handleAddressSubmit}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Endereço de entrega</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div><label style={labelStyle}>Nome</label><input value={address.first_name} onChange={(e) => updateAddr("first_name", e.target.value)} required style={fieldStyle} /></div>
            <div><label style={labelStyle}>Sobrenome</label><input value={address.last_name} onChange={(e) => updateAddr("last_name", e.target.value)} required style={fieldStyle} /></div>
          </div>
          <label style={labelStyle}>Endereço</label>
          <input value={address.address_1} onChange={(e) => updateAddr("address_1", e.target.value)} required style={fieldStyle} />
          <label style={labelStyle}>Complemento</label>
          <input value={address.address_2} onChange={(e) => updateAddr("address_2", e.target.value)} style={fieldStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div><label style={labelStyle}>Cidade</label><input value={address.city} onChange={(e) => updateAddr("city", e.target.value)} required style={fieldStyle} /></div>
            <div><label style={labelStyle}>Estado</label><input value={address.province} onChange={(e) => updateAddr("province", e.target.value)} required style={fieldStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
            <div><label style={labelStyle}>CEP {cepLoading && <span style={{ fontSize: 11, color: "#6b7280" }}>(buscando...)</span>}</label><input value={address.postal_code} onChange={(e) => handleCepChange(e.target.value)} required maxLength={9} placeholder="00000-000" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Telefone</label><input value={address.phone} onChange={(e) => updateAddr("phone", e.target.value)} style={fieldStyle} /></div>
          </div>
          <button type="submit" disabled={loading} className="button button--primary" style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700, marginTop: 10 }}>
            {loading ? "Salvando..." : "Continuar para frete"}
          </button>
        </form>
      )}

      {/* Step 2: Shipping */}
      {step === "shipping" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Opções de frete</h2>
          {shippingOptions.length === 0 ? (
            <p>Nenhuma opção de frete disponível para este endereço.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {shippingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShippingSelect(option.id)}
                  disabled={loading}
                  style={{
                    display: "flex", justifyContent: "space-between", padding: "16px 20px",
                    border: "1px solid var(--border-color)", borderRadius: 8,
                    background: "#fff", cursor: "pointer", fontSize: 15,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{option.name}</span>
                  <span style={{ fontWeight: 700, color: option.amount === 0 ? "var(--success-color)" : "var(--text-color)" }}>
                    {option.amount === 0 ? "Grátis" : formatMoney(option.amount)}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setStep("address")} style={{ marginTop: 16, background: "none", border: "none", color: "var(--link-color)", cursor: "pointer", fontSize: 14 }}>
            ← Voltar para endereço
          </button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Pagamento</h2>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Resumo do pedido</p>
            {cart.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color)" }}>
                <span>{item.title} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{formatMoney(item.total)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontWeight: 700, fontSize: 18 }}>
              <span>Total</span>
              <span>{formatMoney(cart.total)}</span>
            </div>
          </div>

          <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 20, marginBottom: 20, border: "1px solid var(--border-color)" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Pagamento manual</p>
            <p style={{ fontSize: 14, color: "var(--text-color)" }}>
              O pagamento será processado manualmente. Você receberá instruções por e-mail após a confirmação do pedido.
            </p>
          </div>

          <button onClick={handleCompleteOrder} disabled={loading} className="button button--primary" style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700 }}>
            {loading ? "Finalizando..." : `Confirmar pedido — ${formatMoney(cart.total)}`}
          </button>
          <button onClick={() => setStep("shipping")} style={{ marginTop: 12, background: "none", border: "none", color: "var(--link-color)", cursor: "pointer", fontSize: 14, display: "block", width: "100%", textAlign: "center" }}>
            ← Voltar para frete
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === "confirmation" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2 className="heading h2" style={{ marginBottom: 12 }}>Pedido confirmado!</h2>
          <p style={{ color: "var(--text-color)", marginBottom: 8 }}>
            Obrigado pela sua compra. Você receberá um e-mail com os detalhes do pedido.
          </p>
          {orderData && (
            <p style={{ fontSize: 14, color: "#888" }}>
              Pedido #{(orderData as Record<string, string>).display_id || (orderData as Record<string, string>).id}
            </p>
          )}
          <Link href="/" className="button button--primary" style={{ marginTop: 24, display: "inline-block", padding: "12px 32px" }}>
            Voltar para a loja
          </Link>
        </div>
      )}

      <SecureCheckoutBadges />
    </div>
  );
}
