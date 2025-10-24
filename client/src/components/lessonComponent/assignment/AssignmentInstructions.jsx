import React from 'react';

const AssignmentInstructions = ({ instructions, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Instructions
        </label>
        <textarea
          value={instructions}
          onChange={(e) => onUpdate({ instructions: e.target.value })}
          className="w-full px-3 py-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Provide clear instructions for the assignment..."
          rows={8}
        />
      </div>
    </div>
  );
};

export default AssignmentInstructions;