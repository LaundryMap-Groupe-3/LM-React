const AdminTabs = ({ tabs }) => (
  <div className="flex flex-row items-center gap-2 shadow-md bg-white rounded-lg px-4 py-2 mb-8">
    {tabs.map(tab => (
      <a
        key={tab.href}
        href={tab.href}
        className={`p-3 text-[13px] font-medium flex-1 h-9 flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] ${
          tab.active
            ? 'bg-[#3B82F6] text-white'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab.label}
        <span className={`text-xs px-2 py-1 h-6 w-6 rounded-full flex items-center justify-center ${
          tab.active ? 'bg-white/20 text-white' : 'bg-[#F59E0B] text-white'
        }`}>
          {tab.count}
        </span>
      </a>
    ))}
  </div>
);

export default AdminTabs;
