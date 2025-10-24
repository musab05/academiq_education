import React, { useState, useMemo } from "react";

const buildTree = (items, parent = null) =>
  items
    .filter((i) => {
      if (parent === null) return !i.parent || i.parent === 'All' || i.parent === null;
      return String(i.parent) === String(parent) || (typeof i.parent === 'object' && i.parent?._id === parent);
    })
    .map((i) => ({ ...i, children: buildTree(items, i._id) }));

const Chevron = ({ open }) => (
  <svg
    className={`w-4 h-4 transform transition-transform ${open ? "rotate-90" : ""}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M6 6 L14 10 L6 14 Z" />
  </svg>
);

const Node = ({ node, level = 0, openMap, setOpenMap, selected, onSelect }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isOpen = !!openMap[node._id];
  const isSelected = String(selected) === String(node._id);

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-gray-50 transition-colors" style={{ marginLeft: `${level * 16}px` }}>
        <div className="w-4 flex justify-center">
          {hasChildren ? (
            <button
              onClick={() =>
                setOpenMap((m) => ({ ...m, [node._id]: !m[node._id] }))
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="toggle"
              type="button"
            >
              <Chevron open={isOpen} />
            </button>
          ) : (
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          )}
        </div>
        <label className={`flex items-center gap-3 cursor-pointer select-none flex-1 ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
          <input
            type="radio"
            name="category-parent"
            value={node._id}
            checked={isSelected}
            onChange={() => onSelect(node._id)}
            className="text-orange-500 focus:ring-orange-500"
          />
          <span className="text-sm">{node.name}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {node.children.length}
            </span>
          )}
        </label>
      </div>
      {isOpen && hasChildren && (
        <div className="ml-2 border-l border-gray-200 pl-2">
          {node.children.map((c) => (
            <Node
              key={c._id}
              node={c}
              level={level + 1}
              openMap={openMap}
              setOpenMap={setOpenMap}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryParentSelector = ({
  categories = [],
  selected = "All",
  onSelect,
}) => {
  const [openMap, setOpenMap] = useState({});
  const [query, setQuery] = useState("");

  const tree = useMemo(() => buildTree(categories, null), [categories]);

  const filteredTree = useMemo(() => {
    if (!query.trim()) return tree;
    const q = query.toLowerCase();
    const filterNodes = (nodes) =>
      nodes
        .map((n) => ({ ...n, children: filterNodes(n.children || []) }))
        .filter(
          (n) =>
            n.name.toLowerCase().includes(q) ||
            (n.children && n.children.length)
        );
    return filterNodes(tree);
  }, [query, tree]);

  const selectedName = useMemo(() => {
    if (selected === "All" || !selected) return "No parent category";
    const findName = (nodes) => {
      for (const node of nodes) {
        if (String(node._id) === String(selected)) return node.name;
        if (node.children) {
          const found = findName(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findName(tree) || "Unknown category";
  }, [selected, tree]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          placeholder="Search categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Selected: {selectedName}</p>
        </div>
        
        <div className="p-3 max-h-64 overflow-auto">
          <div className="py-1">
            <label className={`flex items-center gap-3 cursor-pointer select-none py-2 px-2 rounded-md hover:bg-gray-50 transition-colors ${(selected === "All" || selected === null) ? 'text-orange-600 font-medium bg-orange-50' : 'text-gray-700'}`}>
              <input
                type="radio"
                name="category-parent"
                value="All"
                checked={selected === "All" || selected === null}
                onChange={() => onSelect("All")}
                className="text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm">No parent category</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Root</span>
            </label>
          </div>

          {filteredTree.length > 0 ? (
            <div className="mt-2 space-y-1">
              {filteredTree.map((n) => (
                <Node
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No categories found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryParentSelector;
