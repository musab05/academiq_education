import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const AssignmentRubric = ({ rubric, onUpdate }) => {
  const addCriteria = () => {
    const newRubric = [...(rubric || []), {
      criteria: '',
      maxPoints: 10,
      description: ''
    }];
    onUpdate({ rubric: newRubric });
  };

  const updateCriteria = (index, field, value) => {
    const newRubric = [...(rubric || [])];
    newRubric[index] = { ...newRubric[index], [field]: value };
    onUpdate({ rubric: newRubric });
  };

  const removeCriteria = (index) => {
    const newRubric = rubric.filter((_, i) => i !== index);
    onUpdate({ rubric: newRubric });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Grading Rubric</h3>
        <button
          onClick={addCriteria}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          <Plus size={16} />
          Add Criteria
        </button>
      </div>

      {(!rubric || rubric.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          <p>No grading criteria added yet</p>
          <p className="text-sm">Add criteria to create a detailed rubric</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rubric.map((criteria, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criteria
                    </label>
                    <input
                      type="text"
                      value={criteria.criteria}
                      onChange={(e) => updateCriteria(index, 'criteria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., Content Quality"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Points
                    </label>
                    <input
                      type="number"
                      value={criteria.maxPoints}
                      onChange={(e) => updateCriteria(index, 'maxPoints', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min="1"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeCriteria(index)}
                  className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={criteria.description}
                  onChange={(e) => updateCriteria(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe what constitutes excellent, good, fair, and poor performance for this criteria"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {rubric && rubric.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Total Points: {rubric.reduce((sum, criteria) => sum + (criteria.maxPoints || 0), 0)}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentRubric;