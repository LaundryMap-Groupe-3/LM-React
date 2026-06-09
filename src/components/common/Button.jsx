const variants = {
  primary:   'bg-[#3B82F6] hover:bg-[#2563EB] text-white focus:ring-2 focus:ring-blue-500',
  secondary: { light: 'bg-gray-200 hover:bg-gray-300 text-gray-800', dark: 'bg-gray-700 hover:bg-gray-600 text-gray-100' },
  success:   'bg-green-500 hover:bg-green-600 text-white',
  danger:    'bg-[#EF4444] hover:bg-red-600 text-white',
};

const Button = ({
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  loadingLabel,
  isDarkTheme = false,
  children,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors text-sm';
  const variantStyle = typeof variants[variant] === 'object'
    ? (isDarkTheme ? variants[variant].dark : variants[variant].light)
    : variants[variant];
  const disabledStyles = (disabled || loading) ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 text-white' : variantStyle;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
};

export default Button;
