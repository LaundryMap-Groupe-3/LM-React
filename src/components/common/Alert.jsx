const lightStyles = {
  error:   'bg-red-50 border border-red-400 text-red-700',
  success: 'bg-green-50 border border-green-400 text-green-700',
  warning: 'bg-yellow-50 border border-yellow-400 text-yellow-700',
};

const darkStyles = {
  error:   'bg-red-900/40 border border-red-500 text-red-300',
  success: 'bg-green-900/40 border border-green-500 text-green-300',
  warning: 'bg-yellow-900/40 border border-yellow-500 text-yellow-300',
};

const Alert = ({ type = 'error', children, className = '', isDarkTheme }) => {
  if (!children) return null;
  const styles = isDarkTheme ? darkStyles : lightStyles;
  return (
    <div className={`mb-4 p-3 rounded-md text-sm whitespace-pre-line ${styles[type]} ${className}`}>
      {children}
    </div>
  );
};

export default Alert;
