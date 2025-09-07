'use client';

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;   // ✅ 1-based (from backend)
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPaginationRange = () => {
    const delta = 1;
    const range: (number | string)[] = [];

    // Ensure currentPage is clamped between 1 and totalPages
    const safePage = Math.max(1, Math.min(currentPage, totalPages));

    for (
      let i = Math.max(1, safePage - delta);
      i <= Math.min(totalPages, safePage + delta);
      i++
    ) {
      range.push(i);
    }

    // Add first page if missing
    if (typeof range[0] === 'number' && range[0] > 1) {
      if (range[0] > 2) range.unshift('…');
      range.unshift(1);
    }

    // Add last page if missing
    const last = range[range.length - 1];
    if (typeof last === 'number' && last < totalPages) {
      if (last < totalPages - 1) range.push('…');
      range.push(totalPages);
    }

    return range;
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <FaChevronLeft className="h-3 w-3" />
      </button>

      {/* Pages */}
      {getPaginationRange().map((page, idx) =>
        page === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`px-2.5 py-1.5 text-sm rounded-md border transition ${
              currentPage === page
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <FaChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
