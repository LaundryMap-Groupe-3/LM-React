const Pagination = ({ currentPage, totalPages, onPageChange, isDarkTheme = false }) => {
  if (totalPages <= 1) return null;

  const base = isDarkTheme
    ? 'bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:bg-[#273549]'
    : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]';
  const disabled = isDarkTheme
    ? 'border border-[#334155] text-[#475569] cursor-not-allowed bg-[#1E293B]'
    : 'border border-[#CBD5E1] text-gray-400 cursor-not-allowed bg-gray-50';
  const active = isDarkTheme ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-[#3B82F6] text-white border-[#3B82F6]';

  return (
    <div className="mt-8 flex justify-center">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Page précédente"
          className={`w-9 h-9 flex rounded-lg items-center justify-center text-lg font-medium border ${
            currentPage === 1 ? disabled : base
          }`}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium border ${
              currentPage === page ? active : base
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Page suivante"
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-medium border ${
            currentPage === totalPages ? disabled : base
          }`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
