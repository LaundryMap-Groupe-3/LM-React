const styles = {
  error:   'bg-red-100 border border-red-400 text-red-700',
  success: 'bg-green-100 border border-green-400 text-green-700',
  warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
};

const Alert = ({ type = 'error', children, className = '' }) => {
  if (!children) return null;
  return (
    <div className={`mb-4 p-3 rounded-md text-sm whitespace-pre-line ${styles[type]} ${className}`}>
      {children}
    </div>
  );
};

export default Alert;
