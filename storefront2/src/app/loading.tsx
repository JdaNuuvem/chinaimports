export default function Loading() {
  return (
    <div
      className="container"
      style={{
        padding: "80px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid var(--border-color, #e1e3e5)",
          borderTopColor: "var(--primary-color, #1e2d7d)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "var(--text-color, #677279)", fontSize: 14 }}>
        Carregando...
      </p>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { to { transform: rotate(360deg); } }" }} />
    </div>
  );
}
