"use client";

import { useState } from "react";
import { fetchAddressByCep, formatCep } from "@/lib/viacep";
import { formatCPF, formatPhone } from "@/lib/sanitize";

export interface AddressData {
  first_name: string;
  last_name: string;
  cpf: string;
  phone: string;
  postal_code: string;
  address_1: string;
  number: string;
  address_2: string;
  neighborhood: string;
  city: string;
  province: string;
  country_code: string;
}

interface AddressFormProps {
  initialData?: Partial<AddressData>;
  onSubmit: (data: AddressData) => void;
  loading?: boolean;
  submitLabel?: string;
}

const EMPTY: AddressData = {
  first_name: "", last_name: "", cpf: "", phone: "",
  postal_code: "", address_1: "", number: "", address_2: "",
  neighborhood: "", city: "", province: "", country_code: "BR",
};

const fieldStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1px solid var(--border-color, #e1e3e5)",
  borderRadius: 6, fontSize: 14, boxSizing: "border-box",
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600,
  marginBottom: 4, color: "#374151",
};

export default function AddressForm({ initialData, onSubmit, loading, submitLabel = "Salvar endereço" }: AddressFormProps) {
  const [data, setData] = useState<AddressData>({ ...EMPTY, ...initialData });
  const [cepLoading, setCepLoading] = useState(false);

  const set = (field: keyof AddressData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    set("postal_code", formatted);
    const clean = value.replace(/\D/g, "");
    if (clean.length === 8) {
      setCepLoading(true);
      const addr = await fetchAddressByCep(clean);
      if (addr) {
        setData((prev) => ({
          ...prev,
          postal_code: formatted,
          address_1: addr.logradouro || prev.address_1,
          neighborhood: addr.bairro || prev.neighborhood,
          city: addr.localidade || prev.city,
          province: addr.uf || prev.province,
        }));
      }
      setCepLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <div>
          <label style={labelStyle}>Nome</label>
          <input required value={data.first_name} onChange={(e) => set("first_name", e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Sobrenome</label>
          <input required value={data.last_name} onChange={(e) => set("last_name", e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
        <div>
          <label style={labelStyle}>CPF</label>
          <input required value={data.cpf} onChange={(e) => set("cpf", formatCPF(e.target.value))} maxLength={14} placeholder="000.000.000-00" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Telefone</label>
          <input required value={data.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} maxLength={15} placeholder="(11) 99999-9999" style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 12px" }}>
        <div>
          <label style={labelStyle}>
            CEP {cepLoading && <span style={{ color: "#6b7280", fontWeight: 400 }}>(buscando...)</span>}
          </label>
          <input required value={data.postal_code} onChange={(e) => handleCepChange(e.target.value)} maxLength={9} placeholder="00000-000" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Endereço</label>
          <input required value={data.address_1} onChange={(e) => set("address_1", e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: "0 12px" }}>
        <div>
          <label style={labelStyle}>Número</label>
          <input required value={data.number} onChange={(e) => set("number", e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Complemento</label>
          <input value={data.address_2} onChange={(e) => set("address_2", e.target.value)} placeholder="Apto, bloco..." style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Bairro</label>
          <input required value={data.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} style={fieldStyle} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "0 12px" }}>
        <div>
          <label style={labelStyle}>Cidade</label>
          <input required value={data.city} onChange={(e) => set("city", e.target.value)} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>UF</label>
          <input required value={data.province} onChange={(e) => set("province", e.target.value.toUpperCase())} maxLength={2} style={fieldStyle} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="button button--primary"
        style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 700, marginTop: 8, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
