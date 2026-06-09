const FormField = ({ label, error, required, children, isDarkTheme }) => (
  <div>
    <label className={`block text-left text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
      {label}{required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && <span className="text-red-400 text-xs mt-1 block">{error}</span>}
  </div>
);

export default FormField;
