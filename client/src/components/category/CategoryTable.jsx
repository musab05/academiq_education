import React, { useState, useMemo } from "react";
import { SearchIcon, FolderIcon } from './CategoryIcons';
import CategoryTableRow from './CategoryTableRow';

const buildTree = (items, parent = null) =>
  items
    .filter((i) => {
      if (parent === null) return !i.parent || i.parent === 'All' || i.parent === null;
      return String(i.parent) === String(parent) || (typeof i.parent === 'object' && i.parent?._id === parent);
    })
    .map((i) => ({ ...i, children: buildTree(items, i._id) }));

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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 max-w-full sm:max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors tap-target"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors tap-target"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category Name
              </th>
              <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTree.length > 0 ? (
              filteredTree.map((category) => (
                <CategoryTableRow
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
                <td colSpan={3} className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FolderIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-3 sm:mb-4" />
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs text-gray-400 mt-1 px-4">
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
        <div className="text-xs text-gray-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
          <span>Total: {categories.length} categories</span>
          <span>Root categories: {tree.length}</span>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;