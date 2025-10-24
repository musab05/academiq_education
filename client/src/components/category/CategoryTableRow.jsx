import React from 'react';
import { ChevronIcon, EditIcon, DeleteIcon, FolderIcon } from './CategoryIcons';
import CategoryBadge from './CategoryBadge';

const CategoryTableRow = ({ category, level = 0, onEdit, onDelete, expandedRows, toggleExpanded }) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedRows.has(category._id);
  const indent = level * 24;

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${level > 0 ? 'bg-gray-50/30' : ''}`}>
        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div className="flex items-center gap-2 sm:gap-3" style={{ paddingLeft: `${indent}px` }}>
            <div className="w-4 flex justify-center flex-shrink-0">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(category._id)}
                  className="text-gray-400 hover:text-orange-500 transition-colors tap-target"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <ChevronIcon open={isExpanded} />
                </button>
              ) : (
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <FolderIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${hasChildren ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{category.name}</span>
              {hasChildren && (
                <CategoryBadge type="count" count={category.children.length} />
              )}
            </div>
          </div>
        </td>
        <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {level > 0 ? (
              <>
                <CategoryBadge type="child" />
                <span className="text-sm text-gray-500">
                  {category.parent?.name || "Unknown"}
                </span>
              </>
            ) : (
              <CategoryBadge type="root" />
            )}
          </div>
        </td>
        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              title="Edit category"
              onClick={() => onEdit(category)}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors tap-target"
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
              className="p-1.5 sm:p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors tap-target"
            >
              <DeleteIcon />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && hasChildren && (
        category.children.map((child) => (
          <CategoryTableRow
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

export default CategoryTableRow;