"use client";

export default function DegradedBanner({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      style={{
        background: "#fff3cd",
        color: "#856404",
        padding: "10px 20px",
        textAlign: "center",
        fontSize: "13px",
        fontWeight: 500,
        borderBottom: "1px solid #ffc107",
      }}
    >
      {message || "Alguns dados podem estar desatualizados. Estamos trabalhando para restaurar o serviço."}
    </div>
  );
}
