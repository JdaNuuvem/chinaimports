import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const pageUrl = (page: number) => {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return page === 1 ? baseUrl : `${baseUrl}${sep}page=${page}`;
  };

  return (
    <nav className="pagination" aria-label="Paginação" style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {currentPage > 1 && (
        <Link
          href={pageUrl(currentPage - 1)}
          className="pagination__prev"
          style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: 4, textDecoration: "none", color: "var(--text-color)" }}
        >
          ←
        </Link>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} style={{ padding: "8px 4px", color: "#888" }}>...</span>
        ) : (
          <Link
            key={page}
            href={pageUrl(page)}
            style={{
              padding: "8px 14px",
              border: page === currentPage ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
              borderRadius: 4,
              textDecoration: "none",
              color: page === currentPage ? "var(--accent-color)" : "var(--text-color)",
              fontWeight: page === currentPage ? 700 : 400,
              background: page === currentPage ? "rgba(0,186,219,0.08)" : "transparent",
            }}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={pageUrl(currentPage + 1)}
          className="pagination__next"
          style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: 4, textDecoration: "none", color: "var(--text-color)" }}
        >
          →
        </Link>
      )}
    </nav>
  );
}
