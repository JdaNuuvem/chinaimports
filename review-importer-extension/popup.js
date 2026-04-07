let scrapedData = null;
let filteredReviews = [];

const $ = (id) => document.getElementById(id);
const statusBox = $("statusBox");
const scrapeBtn = $("scrapeBtn");
const importBtn = $("importBtn");
const statsContainer = $("statsContainer");
const progressContainer = $("progressContainer");
const progressFill = $("progressFill");
const progressText = $("progressText");
const preview = $("preview");

// Restore saved config
chrome.storage.local.get(["serverUrl", "targetProduct"], (r) => {
  if (r.serverUrl) $("serverUrl").value = r.serverUrl;
  if (r.targetProduct) $("targetProduct").value = r.targetProduct;
});

function setStatus(text, type = "info") {
  statusBox.textContent = text;
  statusBox.className = `status status--${type}`;
}

function setProgress(pct, text) {
  progressContainer.style.display = "block";
  progressFill.style.width = `${pct}%`;
  progressText.textContent = text;
}

function applyFilters() {
  if (!scrapedData) return;
  const minRating = parseInt($("minRating").value);
  filteredReviews = scrapedData.reviews.filter((r) => r.rating >= minRating);
  updateStats();
  renderPreview();
}

function updateStats() {
  const withPhotos = filteredReviews.filter((r) => r.images?.length > 0).length;
  const totalPhotos = filteredReviews.reduce((s, r) => s + (r.images?.length || 0), 0);
  const avgRating = filteredReviews.length > 0
    ? (filteredReviews.reduce((s, r) => s + r.rating, 0) / filteredReviews.length).toFixed(1)
    : "-";

  $("statTotal").textContent = filteredReviews.length;
  $("statWithPhotos").textContent = withPhotos;
  $("statPhotos").textContent = totalPhotos;
  $("statRating").textContent = avgRating;
  statsContainer.style.display = "block";
}

function renderPreview() {
  const imageMode = $("imageMode").value;

  preview.innerHTML = filteredReviews.slice(0, 15).map((r) => `
    <div class="preview-card">
      <div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}
        <span class="meta">${r.date || ""} — ${r.author || ""}</span>
      </div>
      ${r.content
        ? `<div class="text">${r.content.slice(0, 180)}${r.content.length > 180 ? "..." : ""}</div>`
        : '<div class="text" style="font-style:italic;color:#bbb">Sem texto (avaliação com foto)</div>'}
      ${imageMode !== "none" && r.images?.length > 0
        ? `<div class="imgs">
            ${r.images.slice(0, 5).map((img) => `<img src="${img}" onerror="this.style.display='none'">`).join("")}
            ${r.images.length > 5 ? `<span style="font-size:10px;color:#1e2d7d;align-self:center;font-weight:600">+${r.images.length - 5}</span>` : ""}
           </div>`
        : ""}
    </div>
  `).join("");

  if (filteredReviews.length > 15) {
    preview.innerHTML += `<p style="text-align:center;font-size:11px;color:#888;padding:6px">... e mais ${filteredReviews.length - 15} avaliações</p>`;
  }
}

// ── Filter change ──
$("minRating").addEventListener("change", applyFilters);
$("imageMode").addEventListener("change", renderPreview);

// ── Scrape ──
scrapeBtn.addEventListener("click", async () => {
  scrapeBtn.disabled = true;
  scrapeBtn.textContent = "Extraindo...";
  setStatus("Extraindo avaliações com paginação automática...", "warning");
  setProgress(10, "Iniciando extração...");
  preview.innerHTML = "";
  statsContainer.style.display = "none";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "scrapeReviews" }, (response) => {
      scrapeBtn.disabled = false;
      scrapeBtn.textContent = "Extrair Todas as Avaliações";
      progressContainer.style.display = "none";

      if (chrome.runtime.lastError) {
        setStatus("Erro: recarregue a página e tente novamente.", "error");
        return;
      }

      if (response?.error) {
        setStatus(response.error, "error");
        return;
      }

      if (!response?.reviews?.length) {
        setStatus("Nenhuma avaliação encontrada. Verifique se a seção de avaliações está carregada e visível na página.", "warning");
        return;
      }

      scrapedData = response;
      applyFilters();

      const platform = response.platform === "shopee" ? "Shopee" : "Mercado Livre";
      const photoCount = response.reviews.reduce((s, r) => s + (r.images?.length || 0), 0);
      setStatus(
        `${response.reviews.length} avaliações extraídas do ${platform} (${photoCount} fotos encontradas)`,
        "success"
      );
    });
  } catch (err) {
    scrapeBtn.disabled = false;
    scrapeBtn.textContent = "Extrair Todas as Avaliações";
    setStatus(`Erro: ${err.message}`, "error");
  }
});

// ── Progress listener ──
chrome.runtime.onMessage?.addListener((msg) => {
  if (msg.type === "scrapeProgress") {
    setProgress(Math.min(90, msg.page * 15), `Página ${msg.page} — ${msg.collected} reviews coletados...`);
  }
});

// ── Import ──
importBtn.addEventListener("click", async () => {
  if (!filteredReviews.length) return;

  const serverUrl = $("serverUrl").value.trim();
  const targetProduct = $("targetProduct").value.trim();
  const imageMode = $("imageMode").value;

  if (!serverUrl) { setStatus("Informe a URL do servidor.", "error"); return; }

  // Save config
  chrome.storage.local.set({ serverUrl, targetProduct });

  importBtn.disabled = true;
  const total = filteredReviews.length;

  // Prepare reviews for bulk import
  const reviewsToImport = filteredReviews.map((r) => ({
    rating: r.rating,
    title: r.content ? r.content.slice(0, 60) : `Avaliação ${r.rating} estrelas`,
    body: r.content || `Avaliação importada de ${scrapedData.platform}`,
    author: r.author || `Cliente ${scrapedData.platform === "shopee" ? "Shopee" : "Mercado Livre"}`,
    images: imageMode === "none" ? [] : (r.images || []),
    source: r.source || scrapedData.platform,
    sourceUrl: r.sourceUrl || scrapedData.pageUrl,
    originalDate: r.date || "",
  }));

  setStatus(`Importando ${total} reviews...`, "warning");
  setProgress(0, "Preparando...");
  progressContainer.style.display = "block";

  if (imageMode === "download") {
    // Import with image download — send in batches of 5
    let imported = 0;
    let photosSaved = 0;
    const batchSize = 5;

    for (let i = 0; i < reviewsToImport.length; i += batchSize) {
      const batch = reviewsToImport.slice(i, i + batchSize);

      try {
        const endpoint = targetProduct
          ? `${serverUrl}/admin/import-reviews/bulk`
          : `${serverUrl}/admin/import-reviews/bulk`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviews: batch,
            productId: targetProduct || undefined,
            downloadImages: true,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          imported += result.imported || batch.length;
          photosSaved += result.photosSaved || 0;
        }
      } catch { /* continue with next batch */ }

      const pct = Math.round(((i + batch.length) / total) * 100);
      setProgress(pct, `${imported}/${total} importados (${photosSaved} fotos salvas)...`);
    }

    progressContainer.style.display = "none";
    importBtn.disabled = false;
    setStatus(`${imported} reviews importados com ${photosSaved} fotos salvas no servidor!`, "success");
  } else {
    // Import without downloading — single bulk request
    try {
      const res = await fetch(`${serverUrl}/admin/import-reviews/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews: reviewsToImport,
          productId: targetProduct || undefined,
          downloadImages: false,
        }),
      });

      progressContainer.style.display = "none";
      importBtn.disabled = false;

      if (res.ok) {
        const result = await res.json();
        setStatus(`${result.imported} reviews importados com sucesso!`, "success");
      } else {
        setStatus(`Erro do servidor: ${res.status}`, "error");
      }
    } catch (err) {
      progressContainer.style.display = "none";
      importBtn.disabled = false;
      setStatus(`Erro de conexão: ${err.message}. O servidor está rodando?`, "error");
    }
  }
});
