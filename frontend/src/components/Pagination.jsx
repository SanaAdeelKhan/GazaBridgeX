// frontend/src/components/Pagination.jsx
import colors from '../theme/colors';

/**
 * Reusable numbered pagination bar.
 * Props:
 *   page:        current page (1-indexed)
 *   totalPages:  total number of pages
 *   onPageChange: (newPage: number) => void
 *   disabled:    optional, disables all buttons (e.g. while loading)
 */
export default function Pagination({ page, totalPages, onPageChange, disabled = false }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // how many neighbours to show on each side of current page

    const range = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }

    pages.push(1);
    if (range[0] > 2) pages.push('ellipsis-start');
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push('ellipsis-end');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const baseBtnStyle = {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    border: `1.5px solid ${colors.inputBorder}`,
    backgroundColor: colors.white,
    color: colors.body,
    transition: 'all 0.15s ease',
  };

  const activeBtnStyle = {
    ...baseBtnStyle,
    backgroundColor: colors.gold,
    color: colors.white,
    borderColor: colors.gold,
  };

  const arrowBtnStyle = {
    ...baseBtnStyle,
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        className="disabled:opacity-40 disabled:cursor-not-allowed"
        style={arrowBtnStyle}
        onMouseEnter={e => { if (!disabled && page > 1) { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.color = colors.body; }}
        aria-label="Previous page"
      >
        ‹
      </button>

      {pageNumbers.map((p, idx) =>
        typeof p === 'number' ? (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={disabled}
            style={p === page ? activeBtnStyle : baseBtnStyle}
            onMouseEnter={e => { if (!disabled && p !== page) { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary; } }}
            onMouseLeave={e => { if (p !== page) { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.color = colors.body; } }}
          >
            {p}
          </button>
        ) : (
          <span key={`${p}-${idx}`} className="px-1 text-sm" style={{ color: colors.muted }}>
            …
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        className="disabled:opacity-40 disabled:cursor-not-allowed"
        style={arrowBtnStyle}
        onMouseEnter={e => { if (!disabled && page < totalPages) { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.color = colors.primary; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.color = colors.body; }}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
