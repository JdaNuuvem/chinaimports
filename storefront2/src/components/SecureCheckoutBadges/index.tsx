const GH_RAW = "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat-rounded";

const PAYMENT_FLAGS: Array<{ name: string; img: string }> = [
  { name: "Mastercard", img: `${GH_RAW}/mastercard.svg` },
  { name: "Visa", img: `${GH_RAW}/visa.svg` },
  { name: "Elo", img: `${GH_RAW}/elo.svg` },
  { name: "Hipercard", img: `${GH_RAW}/hipercard.svg` },
  { name: "Amex", img: `${GH_RAW}/amex.svg` },
  { name: "Diners Club", img: `${GH_RAW}/diners.svg` },
  { name: "Boleto", img: "/icons/boleto.svg" },
  { name: "PIX", img: "/icons/pix.svg" },
];

export default function SecureCheckoutBadges() {
  const trustItems = [
    {
      label: "Compra 100% Segura",
      sub: "Certificado SSL ativo",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
    {
      label: "Dados Protegidos",
      sub: "Criptografia 256-bit",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      label: "Loja Verificada",
      sub: "Google Safe Browsing",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      label: "Devolução Grátis",
      sub: "30 dias garantidos",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 24, padding: "20px 16px", borderTop: "1px solid #e5e7eb", background: "#fafafa", borderRadius: 12 }}>
      {/* Trust badges row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        marginBottom: 18,
      }}>
        {trustItems.map((item) => (
          <div key={item.label} className="trust-badge" style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
          }}>
            <span style={{
              width: 40, height: 40, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#f0fdf4", borderRadius: "50%",
            }}>
              {item.icon}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#1a1c1e" }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Aceitamos
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {PAYMENT_FLAGS.map((flag) => (
            <img
              key={flag.name}
              src={flag.img}
              alt={flag.name}
              title={flag.name}
              className="payment-flag"
              style={{ height: 28, width: "auto", borderRadius: 4 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
