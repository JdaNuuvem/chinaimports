"use client";

import { useState, useRef, useCallback } from "react";
import { PageHeader } from "./shared";

type ProcessingState = "idle" | "loading-model" | "processing" | "done" | "error";

export default function BackgroundRemovalTab() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showBgColor, setShowBgColor] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Por favor, selecione um arquivo de imagem (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("A imagem deve ter no máximo 20MB.");
      return;
    }
    setErrorMsg("");
    setResultImage(null);
    setState("idle");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setOriginalImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [handleFile]);

  const removeBackground = async () => {
    if (!originalImage) return;
    setState("loading-model");
    setProgress(0);
    setErrorMsg("");

    try {
      const { removeBackground: removeBg } = await import("@imgly/background-removal");

      // Use local proxy to avoid CDN fetch failures / CORS issues
      const publicPath = `${window.location.origin}/api/bg-model/`;

      setState("processing");
      let lastProgress = 0;
      const blob = await removeBg(originalImage, {
        publicPath,
        model: "isnet_quint8",
        device: "cpu",
        proxyToWorker: false,
        fetchArgs: { cache: "force-cache" as RequestCache },
        progress: (_key: string, current: number, total: number) => {
          const p = total > 0 ? Math.round((current / total) * 100) : lastProgress;
          if (p > lastProgress) lastProgress = p;
          setProgress(lastProgress);
        },
      });

      const url = URL.createObjectURL(blob);
      setResultImage(url);
      setState("done");
      setProgress(100);
    } catch (err) {
      setState("error");
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        `Erro ao processar: ${msg}. Verifique sua conexão e tente novamente.`
      );
    }
  };

  const triggerServerDownload = async (blob: Blob, dlName: string) => {
    const apiUrl = `/api/download-blob?filename=${encodeURIComponent(dlName)}&type=${encodeURIComponent(blob.type)}`;
    const res = await fetch(apiUrl, { method: "POST", body: blob });
    const resultBlob = await res.blob();
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", dlName);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
  };

  const downloadResult = async () => {
    if (!resultImage) return;
    const baseName = fileName.replace(/\.[^.]+$/, "") || "imagem";

    try {
      if (!showBgColor) {
        const res = await fetch(resultImage);
        const rawBlob = await res.blob();
        const dlName = `${baseName}-sem-fundo.png`;
        const pngBlob = new Blob([rawBlob], { type: "image/png" });
        await triggerServerDownload(pngBlob, dlName);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const dlName = `${baseName}-fundo-${bgColor.replace("#", "")}.png`;
          await triggerServerDownload(blob, dlName);
        }, "image/png");
      };
      img.src = resultImage;
    } catch {
      setErrorMsg("Erro ao baixar a imagem. Tente novamente.");
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    setFileName("");
    setShowBgColor(false);
    setCompareMode(false);
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current || !compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const statusLabel: Record<ProcessingState, string> = {
    idle: "",
    "loading-model": "Carregando modelo de IA...",
    processing: "Removendo fundo...",
    done: "Concluído!",
    error: "Erro no processamento",
  };

  return (
    <div>
      <PageHeader
        title="Remover Fundo de Imagens"
        subtitle="Ferramenta com IA que roda direto no navegador — sem envio de dados externos"
      />

      <div style={{ padding: "0 24px 24px" }} onPaste={handlePaste}>
        {/* Upload Area */}
        {!originalImage && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #ccc",
              borderRadius: 12,
              padding: "60px 40px",
              textAlign: "center",
              cursor: "pointer",
              background: "#fafbfc",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#00badb";
              e.currentTarget.style.background = "#f0fdff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#ccc";
              e.currentTarget.style.background = "#fafbfc";
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#333", margin: "0 0 8px" }}>
              Arraste uma imagem aqui ou clique para selecionar
            </p>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              JPG, PNG ou WebP — máx. 20MB — ou cole com Ctrl+V
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}

        {/* Processing Area */}
        {originalImage && (
          <div>
            {/* Action Bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
              flexWrap: "wrap",
            }}>
              {state === "idle" && (
                <button
                  onClick={removeBackground}
                  style={{
                    padding: "12px 28px",
                    background: "#00badb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#00a5c4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#00badb")}
                >
                  Remover Fundo
                </button>
              )}

              {(state === "loading-model" || state === "processing") && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div style={{
                    flex: 1, maxWidth: 300, height: 8, background: "#e5e7eb",
                    borderRadius: 4, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${progress}%`, height: "100%",
                      background: "linear-gradient(90deg, #00badb, #00d4a0)",
                      borderRadius: 4,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: "#666", whiteSpace: "nowrap" }}>
                    {statusLabel[state]} {progress}%
                  </span>
                </div>
              )}

              {state === "done" && (
                <>
                  <button
                    onClick={downloadResult}
                    style={{
                      padding: "12px 28px",
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Baixar PNG
                  </button>
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    style={{
                      padding: "12px 20px",
                      background: compareMode ? "#333" : "#f3f4f6",
                      color: compareMode ? "#fff" : "#333",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {compareMode ? "✕ Fechar comparação" : "Comparar antes/depois"}
                  </button>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 13, color: "#555", cursor: "pointer",
                  }}>
                    <input
                      type="checkbox"
                      checked={showBgColor}
                      onChange={(e) => setShowBgColor(e.target.checked)}
                    />
                    Cor de fundo
                  </label>
                  {showBgColor && (
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      style={{ width: 36, height: 36, border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", padding: 2 }}
                    />
                  )}
                </>
              )}

              <button
                onClick={reset}
                style={{
                  marginLeft: "auto",
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Nova imagem
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div style={{
                padding: "12px 16px", marginBottom: 16,
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, color: "#dc2626", fontSize: 13,
              }}>
                {errorMsg}
              </div>
            )}

            {/* Compare Slider Mode */}
            {compareMode && resultImage ? (
              <div
                ref={compareRef}
                style={{
                  position: "relative",
                  maxWidth: 800,
                  margin: "0 auto",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "ew-resize",
                  userSelect: "none",
                  border: "1px solid #e5e7eb",
                }}
                onMouseDown={() => { dragging.current = true; }}
                onMouseUp={() => { dragging.current = false; }}
                onMouseLeave={() => { dragging.current = false; }}
                onMouseMove={handleSliderMove}
                onTouchStart={() => { dragging.current = true; }}
                onTouchEnd={() => { dragging.current = false; }}
                onTouchMove={handleSliderMove}
              >
                {/* Result (full width behind) */}
                <img
                  src={resultImage}
                  alt="Resultado"
                  style={{
                    width: "100%", display: "block",
                    background: showBgColor ? bgColor : `repeating-conic-gradient(#d4d4d4 0% 25%, #fff 0% 50%) 0 0 / 20px 20px`,
                  }}
                />
                {/* Original (clipped) */}
                <div style={{
                  position: "absolute", top: 0, left: 0, bottom: 0,
                  width: `${sliderPos}%`,
                  overflow: "hidden",
                }}>
                  <img
                    src={originalImage}
                    alt="Original"
                    style={{ width: compareRef.current?.offsetWidth || "100%", maxWidth: "none", display: "block" }}
                  />
                </div>
                {/* Slider Line */}
                <div style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: `${sliderPos}%`,
                  width: 3, background: "#fff",
                  boxShadow: "0 0 6px rgba(0,0,0,0.4)",
                  transform: "translateX(-50%)",
                }}>
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#333",
                  }}>
                    ↔
                  </div>
                </div>
                {/* Labels */}
                <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  ANTES
                </div>
                <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  DEPOIS
                </div>
              </div>
            ) : (
              /* Side-by-side or single view */
              <div style={{
                display: "grid",
                gridTemplateColumns: resultImage ? "1fr 1fr" : "1fr",
                gap: 20,
                maxWidth: resultImage ? 1000 : 500,
                margin: "0 auto",
              }}>
                {/* Original */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                    Original
                  </p>
                  <div style={{
                    borderRadius: 12, overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}>
                    <img
                      src={originalImage}
                      alt="Original"
                      style={{ width: "100%", display: "block" }}
                    />
                  </div>
                </div>

                {/* Result */}
                {resultImage && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      Sem fundo
                    </p>
                    <div style={{
                      borderRadius: 12, overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      background: showBgColor
                        ? bgColor
                        : `repeating-conic-gradient(#d4d4d4 0% 25%, #fff 0% 50%) 0 0 / 20px 20px`,
                    }}>
                      <img
                        src={resultImage}
                        alt="Resultado"
                        style={{ width: "100%", display: "block" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* First-time info */}
            {state === "idle" && (
              <div style={{
                marginTop: 20, padding: "14px 18px",
                background: "#f0f9ff", border: "1px solid #bae6fd",
                borderRadius: 8, fontSize: 13, color: "#0369a1",
              }}>
                <strong>Primeira vez?</strong> O modelo de IA (~40MB) será baixado automaticamente e armazenado no cache do navegador. Depois disso, o processamento é instantâneo.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
