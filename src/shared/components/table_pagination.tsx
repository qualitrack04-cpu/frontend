interface TablePaginationProps {
  currentPage: number;
  totalResults: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  currentPage,
  totalResults,
  pageSize,
  onPageChange,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startRecord = totalResults === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalResults);

  const renderPaginationButtons = () => {
    let startPage = 1;
    let endPage = Math.min(3, totalPages);

    if (totalPages > 3) {
      if (currentPage <= 2) {
        startPage = 1;
        endPage = 3;
      } else if (currentPage >= totalPages) {
        startPage = Math.max(1, totalPages - 2);
        endPage = totalPages;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages.map((page) => {
      const isActive = currentPage === page;
      return (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer border-none ${
            isActive
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500">
      <div>
        Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-800">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-800">{totalResults}</span> entries
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none bg-transparent"
        >
          Previous
        </button>

        {renderPaginationButtons()}

        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none bg-transparent"
        >
          Next
        </button>
      </div>
    </div>
  );
}
