import React from 'react';
import { ChevronRight, ChevronDown, Building, Edit, Trash2, UserPlus, Crown, Users } from 'lucide-react';

const DepartmentTableRow = ({ 
  department, 
  onEdit, 
  onDelete, 
  onAddMember,
  expandedRows, 
  toggleExpanded, 
  level = 0 
}) => {
  const hasChildren = department.children && department.children.length > 0;
  const isExpanded = expandedRows.has(department._id);

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center" style={{ paddingLeft: `${level * 16}px` }}>
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(department._id)}
                className="mr-1.5 sm:mr-2 p-1 hover:bg-gray-200 rounded transition-colors tap-target"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-5 sm:w-6 mr-1.5 sm:mr-2" />
            )}
            <div className="flex items-center min-w-0">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{department.name}</div>
                <div className="sm:hidden text-xs text-gray-500 mt-0.5">
                  <span className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full font-medium">{department.code}</span>
                  <span className="ml-2">{department.members?.length || 0} members</span>
                </div>
                {department.description && (
                  <div className="hidden sm:block text-xs text-gray-500 truncate">{department.description}</div>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
            {department.code}
          </span>
        </td>
        <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-900">{department.members?.length || 0}</span>
            {department.head && (
              <div className="flex items-center gap-1 ml-2">
                <Crown className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {department.head.firstName} {department.head.lastName}
                </span>
              </div>
            )}
          </div>
        </td>
        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button
              onClick={() => onAddMember(department._id)}
              className="text-orange-600 hover:text-orange-900 p-1 sm:p-1.5 hover:bg-orange-50 rounded transition-colors tap-target"
              title="Add member"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(department)}
              className="text-blue-600 hover:text-blue-900 p-1 sm:p-1.5 hover:bg-blue-50 rounded transition-colors tap-target"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(department._id)}
              className="text-red-600 hover:text-red-900 p-1 sm:p-1.5 hover:bg-red-50 rounded transition-colors tap-target"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      
      {hasChildren && isExpanded && (
        <>
          {department.children.map((child) => (
            <DepartmentTableRow
              key={child._id}
              department={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddMember={onAddMember}
              expandedRows={expandedRows}
              toggleExpanded={toggleExpanded}
              level={level + 1}
            />
          ))}
        </>
      )}
    </>
  );
};

export default DepartmentTableRow;