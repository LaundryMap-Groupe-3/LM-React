const styles = {
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending:  'bg-yellow-100 text-yellow-800',
};

const StatusBadge = ({ status, label, icon }) => {
  const style = styles[status] ?? styles.pending;
  return (
    <span className={`px-3 py-1 text-[12px] font-semibold rounded-md inline-flex items-center gap-2 whitespace-nowrap ${style}`}>
      {icon}
      {label}
    </span>
  );
};

export default StatusBadge;
