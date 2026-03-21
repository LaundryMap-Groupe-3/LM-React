const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDarkTheme, isLoading = false, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 max-w-sm w-full ${
        isDarkTheme 
          ? 'bg-gray-800 border border-gray-600' 
          : 'bg-white border border-gray-200'
      }`}>
        <h2 className={`text-lg font-bold mb-4 ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </h2>
        <p className={`text-sm mb-6 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
          {message}
        </p>
        
        {children}
        
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-md border transition-colors ${
              isDarkTheme 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'En cours...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
