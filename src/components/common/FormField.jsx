const FormField = ({ label, error, required, children }) => (
  <div>
    <label className="block text-left text-sm text-gray-700 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
  </div>
);

export default FormField;
