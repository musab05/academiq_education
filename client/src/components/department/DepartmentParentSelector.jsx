import React, { useState, useMemo } from "react";
import { Search } from 'lucide-react';
import DepartmentTreeNode from './DepartmentTreeNode';

const buildTree = (items, parent = null) =>
  items
    .filter((i) => {
      if (parent === null) return !i.parent || i.parent === 'All' || i.parent === null;
      return String(i.parent) === String(parent) || (typeof i.parent === 'object' && i.parent?._id === parent);
    })
    .map((i) => ({ ...i, children: buildTree(items, i._id) }));

const DepartmentParentSelector = ({
  departments = [],
  selected = "All",
  onSelect,
}) => {
  const [openMap, setOpenMap] = useState({});
  const [query, setQuery] = useState("");

  const tree = useMemo(() => buildTree(departments, null), [departments]);

  const filteredTree = useMemo(() => {
    if (!query.trim()) return tree;
    const q = query.toLowerCase();
    const filterNodes = (nodes) =>
      nodes
        .map((n) => ({ ...n, children: filterNodes(n.children || []) }))
        .filter(
          (n) =>
            n.name.toLowerCase().includes(q) ||
            n.code.toLowerCase().includes(q) ||
            (n.children && n.children.length)
        );
    return filterNodes(tree);
  }, [query, tree]);

  const selectedName = useMemo(() => {
    if (selected === "All" || !selected) return "No parent department";
    const findName = (nodes) => {
      for (const node of nodes) {
        if (String(node._id) === String(selected)) return `${node.name} (${node.code})`;
        if (node.children) {
          const found = findName(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findName(tree) || "Unknown department";
  }, [selected, tree]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          placeholder="Search departments..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
      </div>

      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Selected: {selectedName}</p>
        </div>
        
        <div className="p-3 max-h-48 overflow-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="py-1">
            <label className={`flex items-center gap-3 cursor-pointer select-none py-2 px-2 rounded-md hover:bg-gray-50 transition-colors ${(selected === "All" || selected === null) ? 'text-orange-600 font-medium bg-orange-50' : 'text-gray-700'}`}>
              <input
                type="radio"
                name="department-parent"
                value="All"
                checked={selected === "All" || selected === null}
                onChange={() => onSelect("All")}
                className="text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm">No parent department</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Root</span>
            </label>
          </div>

          {filteredTree.length > 0 ? (
            <div className="mt-2 space-y-1">
              {filteredTree.map((n) => (
                <DepartmentTreeNode
                  key={n._id}
                  node={n}
                  openMap={openMap}
                  setOpenMap={setOpenMap}
                  selected={selected}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">No departments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentParentSelector;