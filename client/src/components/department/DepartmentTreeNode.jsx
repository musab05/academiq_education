import React from 'react';
import { ChevronRight, ChevronDown, Building } from 'lucide-react';

const DepartmentTreeNode = ({ node, level = 0, openMap, setOpenMap, selected, onSelect }) => {
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
              className="text-gray-400 hover:text-orange-500 transition-colors"
              aria-label="toggle"
              type="button"
            >
              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          ) : (
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          )}
        </div>
        <label className={`flex items-center gap-3 cursor-pointer select-none flex-1 ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
          <input
            type="radio"
            name="department-parent"
            value={node._id}
            checked={isSelected}
            onChange={() => onSelect(node._id)}
            className="text-orange-500 focus:ring-orange-500"
          />
          <Building className="w-4 h-4 text-orange-500" />
          <span className="text-sm">{node.name}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{node.code}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{node.children.length}</span>
          )}
        </label>
      </div>
      {isOpen && hasChildren && (
        <div className="ml-2 border-l border-gray-200 pl-2">
          {node.children.map((c) => (
            <DepartmentTreeNode
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

export default DepartmentTreeNode;