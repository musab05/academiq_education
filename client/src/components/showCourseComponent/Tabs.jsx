import React from "react";

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl font-medium whitespace-nowrap tap-target transition-all duration-200 ${
          active === t
            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

export default Tabs;
