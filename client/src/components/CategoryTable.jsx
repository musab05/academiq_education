import React, { useState, useMemo } from "react";

const buildTree = (items, parent = null) =>
  items
    .filter((i) => {
      if (parent === null) return !i.parent || i.parent === 'All' || i.parent === null;
      return String(i.parent) === String(parent) || (typeof i.parent === 'object' && i.parent?._id === parent);
    })
    .map((i) => ({ ...i, children: buildTree(items, i._id) }));

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 transform transition-transform ${open ? "rotate-90" : ""}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M6 6 L14 10 L6 14 Z" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const FolderIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const CategoryRow = ({ category, level = 0, onEdit, onDelete, expandedRows, toggleExpanded }) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedRows.has(category._id);
  const indent = level * 24;

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${level > 0 ? 'bg-gray-50/30' : ''}`}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${indent}px` }}>
            <div className="w-4 flex justify-center">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(category._id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronIcon open={isExpanded} />
                </button>
              ) : (
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <FolderIcon className={`w-4 h-4 ${hasChildren ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-900">{category.name}</span>
              {hasChildren && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  {category.children.length}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {level > 0 ? (
              <>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                  Child
                </span>
                <span className="text-sm text-gray-500">
                  {category.parent?.name || "Unknown"}
                </span>
              </>
            ) : (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                Root
              </span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              title="Edit category"
              onClick={() => onEdit(category)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <EditIcon />
            </button>
            <button
              title="Delete category"
              onClick={() => {
                if (confirm(`Delete "${category.name}" category?${hasChildren ? ' This will also delete all subcategories.' : ''}`)) {
                  onDelete(category._id);
                }
              }}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <DeleteIcon />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && hasChildren && (
        category.children.map((child) => (
          <CategoryRow
            key={child._id}
            category={child}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
            expandedRows={expandedRows}
            toggleExpanded={toggleExpanded}
          />
        ))
      )}
    </>
  );
};

const CategoryTable = ({ categories = [], onEdit, onDelete }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const tree = useMemo(() => buildTree(categories, null), [categories]);

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    const q = searchQuery.toLowerCase();
    const filterNodes = (nodes) =>
      nodes
        .map((n) => ({ ...n, children: filterNodes(n.children || []) }))
        .filter(
          (n) =>
            n.name.toLowerCase().includes(q) ||
            (n.children && n.children.length)
        );
    return filterNodes(tree);
  }, [searchQuery, tree]);

  const toggleExpanded = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const getAllIds = (nodes) => {
      let ids = [];
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          ids.push(node._id);
          ids = ids.concat(getAllIds(node.children));
        }
      });
      return ids;
    };
    setExpandedRows(new Set(getAllIds(tree)));
  };

  const collapseAll = () => {
    setExpandedRows(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTree.length > 0 ? (
              filteredTree.map((category) => (
                <CategoryRow
                  key={category._id}
                  category={category}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  expandedRows={expandedRows}
                  toggleExpanded={toggleExpanded}
                />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FolderIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchQuery ? 'Try adjusting your search terms' : 'Create your first category to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {categories.length > 0 && (
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Total: {categories.length} categories</span>
          <span>Root categories: {tree.length}</span>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;
