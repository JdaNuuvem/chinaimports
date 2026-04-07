// ══════════════════════════════════════════════════════════
// UA Review Importer — Content Script
// Scrapes reviews + photos from Shopee and Mercado Livre
// with auto-pagination to collect ALL reviews
// ══════════════════════════════════════════════════════════

(() => {
  const PLATFORM = detectPlatform();

  function detectPlatform() {
    const host = window.location.hostname;
    if (host.includes("shopee")) return "shopee";
    if (host.includes("mercadolivre")) return "mercadolivre";
    return null;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ──────────────────────────────────
  // MERCADO LIVRE
  // ──────────────────────────────────

  function scrapeMLCurrentPage() {
    const reviews = [];

    // The comments container holds individual review cards
    const commentsContainer = document.querySelector(".ui-review-capability-comments");
    if (!commentsContainer) return reviews;

    // Each comment is a direct child without a specific class, but contains
    // .ui-review-capability-comments__comment__header as first meaningful child.
    // We select all header elements and navigate to their parent card.
    const headers = commentsContainer.querySelectorAll(".ui-review-capability-comments__comment__header");

    headers.forEach((header) => {
      const card = header.parentElement;
      if (!card) return;

      const ratingText = card.querySelector(".andes-visually-hidden")?.textContent || "";
      const ratingMatch = ratingText.match(/(\d+) de 5/);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 5;

      const date = card.querySelector(".ui-review-capability-comments__comment__date")?.textContent?.trim() || "";

      const contentEl = card.querySelector(".ui-review-capability-comments__comment__content p");
      const content = contentEl?.textContent?.trim() || "";

      // ONLY get images from this comment's SECONDARY carousel (not the primary/global one)
      const images = [];
      const seen = new Set();
      const secondaryCarousel = card.querySelector(".ui-review-capability-comments__comment__carousel--secondary");
      if (secondaryCarousel) {
        secondaryCarousel.querySelectorAll(
          ".ui-review-capability-carousel__img-container.reviews-carousel-secondary img"
        ).forEach((img) => {
          const src = img.src || img.getAttribute("data-src") || img.getAttribute("data-zoom") || "";
          if (src && src.startsWith("http") && !src.includes("icon") && !src.includes("svg")) {
            // Get highest resolution: remove ML size suffixes
            const fullRes = src.replace(/-[A-Z]\.jpg/, ".jpg").replace(/\?.*$/, "");
            if (!seen.has(fullRes)) {
              seen.add(fullRes);
              images.push(fullRes);
            }
          }
        });
      }

      reviews.push({ rating, date, content, images, author: "Cliente Mercado Livre" });
    });

    return reviews;
  }

  async function scrapeMLAllPages(onProgress) {
    const allReviews = [];
    let page = 1;

    // First collect current page
    let currentReviews = scrapeMLCurrentPage();
    allReviews.push(...currentReviews);
    onProgress?.({ page, collected: allReviews.length });

    // Try to paginate
    while (true) {
      const nextBtn = document.querySelector(
        ".ui-review-capability-comments__paging .andes-pagination__button--next:not(.andes-pagination__button--disabled) a," +
        ".andes-pagination__button--next:not(.andes-pagination__button--disabled) button"
      );

      if (!nextBtn) break;

      nextBtn.click();
      page++;
      await sleep(2000); // wait for new reviews to load

      currentReviews = scrapeMLCurrentPage();
      if (currentReviews.length === 0) break;

      allReviews.push(...currentReviews);
      onProgress?.({ page, collected: allReviews.length });

      // Safety limit
      if (page > 50) break;
    }

    const overallRating = document.querySelector(".ui-review-capability__rating__average")?.textContent?.trim();
    const totalLabel = document.querySelector(".ui-review-capability__rating__label")?.textContent?.trim();
    const productTitle = document.querySelector("h1.ui-pdp-title")?.textContent?.trim() || document.title;

    return {
      platform: "mercadolivre",
      productTitle,
      overallRating: overallRating ? parseFloat(overallRating) : null,
      totalReviewsLabel: totalLabel,
      reviews: allReviews,
      scrapedAt: new Date().toISOString(),
      pageUrl: window.location.href,
    };
  }

  // ──────────────────────────────────
  // SHOPEE
  // ──────────────────────────────────

  function scrapeShopeeCurrentPage() {
    const reviews = [];

    // Try multiple known selectors for Shopee review cards
    const selectors = [
      ".shopee-product-rating",
      "[class*='product-rating-overview__filter'] ~ div > div",
      ".product-ratings [class*='comment-list'] > div",
    ];

    let cards = [];
    for (const sel of selectors) {
      cards = document.querySelectorAll(sel);
      if (cards.length > 0) break;
    }

    cards.forEach((card) => {
      // Rating: multiple approaches
      let rating = 5;
      const starsSolid = card.querySelectorAll("svg[style*='color: rgba(255, 167, 0'], .icon-rating-solid--active");
      if (starsSolid.length > 0) {
        rating = starsSolid.length;
      } else {
        const ratingHidden = card.querySelector(".andes-visually-hidden, [class*='visually-hidden']");
        if (ratingHidden) {
          const m = ratingHidden.textContent.match(/(\d)/);
          if (m) rating = parseInt(m[1]);
        }
      }

      // Author
      const author =
        card.querySelector(".shopee-product-rating__author-name, [class*='author-name'], [class*='user-name']")
          ?.textContent?.trim() || "Cliente Shopee";

      // Date
      const date =
        card.querySelector(".shopee-product-rating__time, [class*='time'], [class*='date']")
          ?.textContent?.trim() || "";

      // Content
      const content =
        card.querySelector(".shopee-product-rating__content, [class*='comment-content'], [class*='rating__content']")
          ?.textContent?.trim() || "";

      // Images — get all, convert to full resolution
      const images = [];
      card.querySelectorAll(
        ".shopee-product-rating__image, [class*='rating'] img[src*='http'], [class*='comment'] img[src*='http']"
      ).forEach((img) => {
        let src = img.src || img.getAttribute("data-src") || "";
        if (!src || src.includes("data:image") || src.includes("shopee.co.id/file/") === false && src.includes("cf.shopee") === false) {
          // Try other attributes
          src = img.getAttribute("data-zoom") || img.getAttribute("data-original") || "";
        }
        if (src && src.startsWith("http")) {
          // Remove thumbnail suffix to get full image
          const fullRes = src
            .replace(/_tn$/, "")
            .replace(/_tn\./, ".")
            .replace(/\?.*$/, "");
          if (!images.includes(fullRes)) images.push(fullRes);
        }
      });

      // Also check for images in child divs (some layouts)
      card.querySelectorAll("div[style*='background-image']").forEach((div) => {
        const style = div.getAttribute("style") || "";
        const urlMatch = style.match(/url\(["']?(https?:\/\/[^"')]+)/);
        if (urlMatch && !images.includes(urlMatch[1])) {
          images.push(urlMatch[1].replace(/_tn$/, "").replace(/\?.*$/, ""));
        }
      });

      // Videos
      const videos = [];
      card.querySelectorAll("video source, video[src]").forEach((v) => {
        const src = v.src || v.getAttribute("src") || "";
        if (src) videos.push(src);
      });

      if (content || images.length > 0 || videos.length > 0) {
        reviews.push({
          rating: Math.min(5, Math.max(1, rating)),
          date,
          content,
          author,
          images,
          videos,
        });
      }
    });

    return reviews;
  }

  async function scrapeShopeeAllPages(onProgress) {
    const allReviews = [];
    let page = 1;

    let currentReviews = scrapeShopeeCurrentPage();
    allReviews.push(...currentReviews);
    onProgress?.({ page, collected: allReviews.length });

    // Shopee pagination: look for page buttons or "next" arrow
    while (true) {
      const nextBtn = document.querySelector(
        ".shopee-icon-button--right:not([disabled]), " +
        "button.shopee-icon-button--right, " +
        "[class*='pagination'] button:last-child:not([disabled]), " +
        ".product-ratings [class*='page-controller'] button:last-child:not([disabled])"
      );

      if (!nextBtn) break;

      nextBtn.click();
      page++;
      await sleep(2500); // Shopee loads reviews via AJAX

      currentReviews = scrapeShopeeCurrentPage();
      if (currentReviews.length === 0) break;

      // Detect duplicates by content
      const existingContents = new Set(allReviews.map((r) => r.content + r.author));
      const newReviews = currentReviews.filter((r) => !existingContents.has(r.content + r.author));
      if (newReviews.length === 0) break;

      allReviews.push(...newReviews);
      onProgress?.({ page, collected: allReviews.length });

      if (page > 50) break;
    }

    const productTitle =
      document.querySelector("h1, [class*='product-name'], .page-product__title")?.textContent?.trim() || document.title;
    const ratingEl = document.querySelector(
      "[class*='rating-overview'] [class*='average'], .product-rating-overview__rating-average"
    );

    return {
      platform: "shopee",
      productTitle,
      overallRating: ratingEl ? parseFloat(ratingEl.textContent) : null,
      totalReviewsLabel: null,
      reviews: allReviews.map((r) => ({ ...r, source: "shopee", sourceUrl: window.location.href })),
      scrapedAt: new Date().toISOString(),
      pageUrl: window.location.href,
    };
  }

  // ──────────────────────────────────
  // PRODUCT SCRAPER (Shopee & ML)
  // ──────────────────────────────────

  function scrapeProductData() {
    if (PLATFORM === "mercadolivre") {
      const title = document.querySelector("h1.ui-pdp-title")?.textContent?.trim() || document.title;
      const priceEl = document.querySelector(".andes-money-amount__fraction");
      const centsEl = document.querySelector(".andes-money-amount__cents");
      const price = priceEl ? parseInt(priceEl.textContent.replace(/\D/g, "")) * 100 + (centsEl ? parseInt(centsEl.textContent) : 0) : 0;

      // Only get product gallery images — scoped to the gallery container
      // Avoids enhanced content images, variation thumbnails, seller banners, etc.
      const galleryContainer = document.querySelector(".ui-pdp-gallery");
      const imageUrls = [];
      if (galleryContainer) {
        galleryContainer.querySelectorAll(".ui-pdp-thumbnail img, .ui-pdp-gallery__figure img").forEach((img) => {
          const src = img.getAttribute("data-zoom") || img.getAttribute("src") || "";
          if (src && src.startsWith("http") && src.includes("mlstatic")) {
            imageUrls.push(src);
          }
        });
      }
      // Fallback: if gallery not found, try main product image only
      if (imageUrls.length === 0) {
        document.querySelectorAll(".ui-pdp-image").forEach((img) => {
          const src = img.getAttribute("data-zoom") || img.getAttribute("src") || "";
          if (src && src.startsWith("http") && src.includes("mlstatic")) {
            imageUrls.push(src);
          }
        });
      }
      const images = [...new Set(imageUrls)].slice(0, 15);

      const description = document.querySelector(".ui-pdp-description__content p, .ui-pdp-description p")?.textContent?.trim() || "";

      const specs = [];
      document.querySelectorAll(".andes-table__row, .ui-pdp-specs__table tr").forEach((row) => {
        const cells = row.querySelectorAll("td, th");
        if (cells.length >= 2) specs.push({ key: cells[0].textContent.trim(), value: cells[1].textContent.trim() });
      });

      return {
        title, price, description: description.slice(0, 2000), images, specs,
        brand: specs.find((s) => s.key === "Marca")?.value || "",
        source: "mercadolivre", sourceUrl: window.location.href,
      };
    }

    if (PLATFORM === "shopee") {
      const title = document.querySelector("h1, [class*='product-name'], .page-product__title")?.textContent?.trim() || document.title;

      // Price
      const priceEl = document.querySelector("[class*='price-container'] [class*='current'], .product-price [class*='current']");
      let price = 0;
      if (priceEl) {
        const priceText = priceEl.textContent.replace(/[^\d,]/g, "").replace(",", ".");
        price = Math.round(parseFloat(priceText) * 100) || 0;
      }

      // Images from carousel
      const images = [...new Set(
        Array.from(document.querySelectorAll("[class*='product'] img, .product-image img, [class*='carousel'] img"))
          .map((img) => (img.src || img.getAttribute("data-src") || "").replace(/_tn$/, ""))
          .filter((u) => u.startsWith("http") && (u.includes("cf.shopee") || u.includes("shopeemobile")))
      )].slice(0, 15);

      // Description
      const description = document.querySelector("[class*='product-detail'] [class*='content'], .product-detail [class*='description']")?.textContent?.trim() || "";

      // Variations
      const variants = [];
      document.querySelectorAll("[class*='variation'] button, [class*='tier-variation'] button").forEach((btn) => {
        const name = btn.textContent?.trim();
        if (name && name.length < 50) variants.push({ name, price, stock: 50 });
      });

      const specs = [];
      document.querySelectorAll("[class*='product-detail'] [class*='attribute'], .product-detail [class*='spec'] > div").forEach((row) => {
        const label = row.querySelector("[class*='label']")?.textContent?.trim();
        const value = row.querySelector("[class*='value']")?.textContent?.trim();
        if (label && value) specs.push({ key: label, value });
      });

      return {
        title, price, description: description.slice(0, 2000), images, specs, variants,
        brand: specs.find((s) => s.key?.toLowerCase().includes("marca"))?.value || "",
        source: "shopee", sourceUrl: window.location.href,
      };
    }

    return { error: "Site não suportado" };
  }

  // ──────────────────────────────────
  // MESSAGE HANDLER
  // ──────────────────────────────────

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "scrapeReviews") {
      const scrape = async () => {
        let result;
        if (PLATFORM === "mercadolivre") {
          result = await scrapeMLAllPages((progress) => {
            chrome.runtime.sendMessage({ type: "scrapeProgress", ...progress });
          });
        } else if (PLATFORM === "shopee") {
          result = await scrapeShopeeAllPages((progress) => {
            chrome.runtime.sendMessage({ type: "scrapeProgress", ...progress });
          });
        } else {
          result = { error: "Site não suportado. Abra um produto na Shopee ou Mercado Livre." };
        }
        sendResponse(result);
      };
      scrape();
      return true; // keep channel open for async
    }

    if (msg.action === "scrapeProduct") {
      sendResponse(scrapeProductData());
    }

    if (msg.action === "getPlatform") {
      sendResponse({ platform: PLATFORM, url: window.location.href });
    }

    return true;
  });
})();
