const TagFilter = ({ items, selected = [], onChange, isDarkTheme }) => {
  function toggle(value) {
    onChange(sel => sel.includes(value) ? sel.filter(v => v !== value) : [...sel, value]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <button
          type="button"
          key={item.value}
          onClick={() => toggle(item.value)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full border transition ${
            selected.includes(item.value)
              ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow'
              : isDarkTheme
                ? 'bg-slate-600 text-slate-200 border-slate-500 hover:bg-slate-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;
