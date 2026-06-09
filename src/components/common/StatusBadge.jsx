const styles = {
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending:  'bg-yellow-100 text-yellow-800',
};

const darkStyles = {
  approved: 'bg-green-900/50 text-green-300',
  rejected: 'bg-red-900/50 text-red-300',
  pending:  'bg-yellow-900/50 text-yellow-300',
};

const StatusBadge = ({ status, label, icon, darkTheme }) => {
  const style = (darkTheme ? darkStyles[status] : styles[status]) ?? (darkTheme ? darkStyles.pending : styles.pending);
  return (
    <span className={`px-3 py-1 text-[12px] font-semibold rounded-md inline-flex items-center gap-2 whitespace-nowrap ${style}`}>
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;
