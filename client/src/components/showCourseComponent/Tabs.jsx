import React from 'react';

const Tabs = ({ tabs, active, onChange }) => (
  <div className="bg-white rounded-md shadow-sm p-0.5 sm:p-1 flex gap-0.5 sm:gap-1 border border-gray-100 overflow-x-auto scrollbar-hide">
    {tabs.map((t) => (
      <button key={t} onClick={() => onChange(t)} className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm rounded-md font-medium whitespace-nowrap tap-target ${active === t ? "bg-white shadow text-orange-600" : "text-gray-600 hover:text-gray-900"}`}>
        {t}
      </button>
    ))}
  </div>
);

export default Tabs;