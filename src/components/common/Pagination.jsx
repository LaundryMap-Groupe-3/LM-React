const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex rounded-lg items-center justify-center text-lg font-medium ${
            currentPage === 1
              ? 'border border-[#CBD5E1] text-black cursor-not-allowed bg-gray-50'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
          }`}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium ${
              currentPage === page
                ? 'bg-[#3B82F6] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-medium ${
            currentPage === totalPages
              ? 'border border-[#CBD5E1] text-gray-400 cursor-not-allowed bg-gray-50'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-[#CBD5E1]'
          }`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
