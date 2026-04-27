import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  goToPrevious,
  goToNext,
  goToPage,
  startItem,
  endItem,
  totalItems,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
      <p className="text-sm text-blue-200">
        Showing <span className="font-semibold text-white">{startItem}</span> to{" "}
        <span className="font-semibold text-white">{endItem}</span> of{" "}
        <span className="font-semibold text-white">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FaChevronLeft size={12} />
          Prev
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                : "text-white bg-white/10 hover:bg-white/20"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

