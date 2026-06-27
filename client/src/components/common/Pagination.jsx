"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

/**
 * Reusable pagination component matching the project design system.
 *
 * Props:
 *  page        — current page number (1-indexed)
 *  limit       — items per page
 *  total       — total item count
 *  totalPages  — total number of pages
 *  onPageChange — ({ page, limit }) => void
 *  showPageSize — boolean, show the page-size dropdown (default: true)
 */
export default function Pagination({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  showPageSize = true,
}) {
  if (total === 0) return null;

  const computedTotalPages = totalPages || Math.ceil(total / limit) || 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= computedTotalPages && newPage !== page) {
      onPageChange({ page: newPage, limit });
    }
  };

  const handleLimitChange = (newLimit) => {
    onPageChange({ page: 1, limit: newLimit });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (computedTotalPages <= maxVisible) {
      for (let i = 1; i <= computedTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(computedTotalPages - 1, page + 1);

      if (page <= 3) {
        end = Math.min(4, computedTotalPages - 1);
      }
      if (page >= computedTotalPages - 2) {
        start = Math.max(2, computedTotalPages - 3);
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < computedTotalPages - 1) pages.push("...");

      pages.push(computedTotalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-[var(--border)]">
      {/* Info text */}
      <div className="text-xs font-medium text-[var(--muted)] order-2 sm:order-1">
        Showing <span className="font-black text-[var(--text)]">{startItem}–{endItem}</span> of{" "}
        <span className="font-black text-[var(--text)]">{total}</span> results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* Page size selector */}
        {showPageSize && (
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="h-9 px-2.5 text-xs font-bold rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--text)] outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        )}

        {/* First page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={page === 1}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="First page"
        >
          <ChevronsLeft size={14} strokeWidth={2.5} />
        </button>

        {/* Previous */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Previous page"
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="h-9 w-6 flex items-center justify-center text-xs font-bold text-[var(--muted)]"
              >
                ⋯
              </span>
            ) : (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`h-9 min-w-[36px] px-2 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  p === page
                    ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                    : "border border-[var(--border)] bg-[var(--input)] text-[var(--text)] hover:bg-[var(--hover)]"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === computedTotalPages}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Next page"
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>

        {/* Last page */}
        <button
          onClick={() => handlePageChange(computedTotalPages)}
          disabled={page === computedTotalPages}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--input)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="Last page"
        >
          <ChevronsRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
