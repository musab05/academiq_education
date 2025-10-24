import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, MessageCircle, Video, Search, Plus, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { teamAPI } from '../../services/api';

const StudentTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    try {
      const response = await teamAPI.getTeams();
      setTeams(response.data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isOrganizer = (team) => {
    if (!user?._id) return false;
    return team.members?.some(member => 
      (member.user?._id === user._id || member.user === user._id) && member.role === 'organizer'
    );
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return;
    
    setCreating(true);
    setError('');
    try {
      const response = await teamAPI.createTeam(newTeam);
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
      setTeams(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error creating team:', error);
      setError(error.response?.data?.error || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Teams</h1>
                <p className="text-gray-600">Collaborate with your team members</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search teams..."
                    className="w-64 h-10 pl-4 pr-10 rounded-md border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Team
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
                <p className="text-gray-500">You are not a member of any teams yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                  <div
                    key={team._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3">
                          {team.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                          {isOrganizer(team) && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                              Organizer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {team.description || 'No description'}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Users size={16} className="mr-1" />
                      <span>{team.members?.length || 0} members</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/teams/${team._id}`)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Chat
                      </button>
                      {isOrganizer(team) && (
                        <button
                          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Video size={16} />
                          Meeting
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create New Team</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Enter team description"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTeam}
                  disabled={!newTeam.name.trim() || creating}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTeamsPage;
