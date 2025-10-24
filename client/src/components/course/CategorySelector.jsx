import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

const buildTree = (items, parent = null) =>
  items
    .filter((i) => {
      if (parent === null) return !i.parent || i.parent === 'All' || i.parent === null;
      return String(i.parent) === String(parent) || (typeof i.parent === 'object' && i.parent?._id === parent);
    })
    .map((i) => ({ ...i, children: buildTree(items, i._id) }));

const CategoryTreeNode = ({ node, openMap, setOpenMap, selected, onToggle, level = 0 }) => {
  const isOpen = openMap[node._id];
  const isSelected = selected.includes(node._id);
  const hasChildren = node.children && node.children.length > 0;

  const toggleOpen = () => {
    setOpenMap(prev => ({ ...prev, [node._id]: !prev[node._id] }));
  };

  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
          isSelected ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {hasChildren ? (
          <button onClick={toggleOpen} className="p-0.5 hover:bg-gray-200 rounded">
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(node._id)}
            className="text-orange-500 focus:ring-orange-500 rounded"
          />
          <span className="text-sm font-medium">{node.name}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {node.children.length}
            </span>
          )}
        </label>
      </div>

      {isOpen && hasChildren && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child._id}
              node={child}
              openMap={openMap}
              setOpenMap={setOpenMap}
              selected={selected}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategorySelector = ({ categories = [], selected = [], onSelect }) => {
  const [openMap, setOpenMap] = useState({});
  const [query, setQuery] = useState('');

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

  const handleToggle = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    if (!category) return;

    let newSelected = [...selected];
    
    if (selected.includes(categoryId)) {
      // Remove category and all its children
      const removeWithChildren = (catId) => {
        newSelected = newSelected.filter(id => id !== catId);
        const children = categories.filter(cat => 
          String(cat.parent) === String(catId) || 
          (typeof cat.parent === 'object' && cat.parent?._id === catId)
        );
        children.forEach(child => removeWithChildren(child._id));
      };
      removeWithChildren(categoryId);
    } else {
      // Add category
      newSelected.push(categoryId);
      
      // Auto-select all children when parent is selected
      const addChildren = (parentId) => {
        const children = categories.filter(cat => 
          String(cat.parent) === String(parentId) || 
          (typeof cat.parent === 'object' && cat.parent?._id === parentId)
        );
        children.forEach(child => {
          if (!newSelected.includes(child._id)) {
            newSelected.push(child._id);
            addChildren(child._id);
          }
        });
      };
      addChildren(categoryId);
    }

    // Use setTimeout to batch the update and reduce jitter
    setTimeout(() => onSelect(newSelected), 0);
  };

  const selectedNames = useMemo(() => {
    return selected.map(id => {
      const category = categories.find(cat => cat._id === id);
      return category?.name || 'Unknown';
    });
  }, [selected, categories]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          placeholder="Search categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
      </div>

      {selected.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 transition-all duration-200">
          <p className="text-xs font-medium text-orange-800 mb-2">Selected Categories:</p>
          <div className="flex flex-wrap gap-1">
            {selectedNames.map((name, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 transition-all duration-150"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg bg-white max-h-64 overflow-auto">
        {filteredTree.length > 0 ? (
          <div className="p-2">
            {filteredTree.map((node) => (
              <CategoryTreeNode
                key={node._id}
                node={node}
                openMap={openMap}
                setOpenMap={setOpenMap}
                selected={selected}
                onToggle={handleToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-8 h-8 mx-auto mb-2 text-gray-300">
              <Search className="w-full h-full" />
            </div>
            <p className="text-sm">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;