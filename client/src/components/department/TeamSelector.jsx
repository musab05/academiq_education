import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, UsersRound } from 'lucide-react';

const TeamSelector = ({ teams, selected, onSelect, placeholder = "Select a team" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTeam = teams.find(team => team._id === selected);
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedTeam ? (
            <>
              <UsersRound className="w-4 h-4 text-orange-600" />
              <span className="text-gray-900">{selectedTeam.name}</span>
              <span className="text-xs text-gray-500">({selectedTeam.members?.length || 0} members)</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredTeams.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No teams found</div>
            ) : (
              filteredTeams.map((team) => (
                <button
                  key={team._id}
                  type="button"
                  onClick={() => {
                    onSelect(team._id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                    selected === team._id ? 'bg-orange-50' : ''
                  }`}
                >
                  <UsersRound className={`w-4 h-4 ${selected === team._id ? 'text-orange-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${selected === team._id ? 'text-orange-600' : 'text-gray-900'}`}>
                      {team.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {team.members?.length || 0} members
                      {team.department?.name && ` • ${team.department.name}`}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSelector;
