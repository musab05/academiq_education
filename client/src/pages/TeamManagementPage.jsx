import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users, Crown, User, Trash2, UserPlus, Settings, MessageCircle, Video, TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import CreateTeamModal from '../components/team/CreateTeamModal';
import AddMemberModal from '../components/team/AddMemberModal';
import { teamAPI, userAPI, courseAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const TeamManagementPage = () => {
  const { user } = useSelector(state => state.user);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [memberProgress, setMemberProgress] = useState({});

  useEffect(() => {
    fetchTeams();
    fetchUsers();
    if (user?.role === 'student') {
      fetchMemberProgress();
    }
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      showNotification({ type: 'error', message: 'Failed to fetch teams' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMemberProgress = async () => {
    try {
      const enrolledResponse = await courseAPI.getEnrolledCourses();
      const enrolledCourses = enrolledResponse.data || [];
      
      const progressData = {};
      for (const team of teams) {
        for (const member of team.members) {
          if (!progressData[member.user._id]) {
            const memberCourses = enrolledCourses.filter(c => 
              c.enrolledUsers?.some(u => u._id === member.user._id)
            );
            const totalProgress = memberCourses.reduce((sum, c) => sum + (c.progress || 0), 0);
            const avgProgress = memberCourses.length > 0 ? Math.round(totalProgress / memberCourses.length) : 0;
            progressData[member.user._id] = {
              coursesEnrolled: memberCourses.length,
              avgProgress,
              completedCourses: memberCourses.filter(c => c.progress === 100).length
            };
          }
        }
      }
      setMemberProgress(progressData);
    } catch (error) {
      console.error('Error fetching member progress:', error);
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      setCreating(true);
      const response = await teamAPI.createTeam(teamData);
      setTeams(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      showNotification({ type: 'success', message: 'Team created successfully' });
    } catch (error) {
      console.error('Error creating team:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to create team' 
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (userId, role = 'member') => {
    if (!showAddMemberModal) return;
    
    try {
      setAddingMember(true);
      const response = await teamAPI.addMember(showAddMemberModal, { userId, role });
      setTeams(prev => prev.map(t => t._id === showAddMemberModal ? response.data : t));
      setShowAddMemberModal(null);
      showNotification({ type: 'success', message: 'Member added successfully' });
    } catch (error) {
      console.error('Error adding member:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to add member' 
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    
    try {
      const response = await teamAPI.removeMember(teamId, userId);
      setTeams(prev => prev.map(t => t._id === teamId ? response.data : t));
      showNotification({ type: 'success', message: 'Member removed successfully' });
    } catch (error) {
      console.error('Error removing member:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to remove member' 
      });
    }
  };

  const handleToggleRole = async (teamId, userId, currentRole) => {
    const newRole = currentRole === 'manager' ? 'member' : 'manager';
    try {
      const response = await teamAPI.updateMemberRole(teamId, userId, { role: newRole });
      setTeams(prev => prev.map(t => t._id === teamId ? response.data : t));
      showNotification({ type: 'success', message: 'Role updated successfully' });
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to update role' 
      });
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvailableUsers = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    const teamMemberIds = team?.members.map(m => m.user._id) || [];
    return users.filter(u => !teamMemberIds.includes(u._id));
  };

  const canManageTeam = (team) => {
    const member = team.members.find(m => m.user._id === user._id);
    return member?.role === 'manager' || team.createdBy._id === user._id;
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(true); }} />
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {isStudent && (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg sm:rounded-xl p-4 sm:p-8 mb-4 sm:mb-6 text-white">
                <h1 className="text-xl sm:text-3xl font-bold mb-2">My Study Teams</h1>
                <p className="text-sm sm:text-base text-orange-100">Collaborate with peers, track progress, and achieve goals together</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                {!isStudent && (
                  <>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Teams</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Manage teams and their members</p>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 transition-colors tap-target w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 mb-4 sm:mb-6">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-sm sm:text-base text-gray-500">
                No teams found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredTeams.map((team) => {
                  const isManager = canManageTeam(team);
                  const teamAvgProgress = isStudent ? (team.members.reduce((sum, m) => 
                    sum + (memberProgress[m.user._id]?.avgProgress || 0), 0
                  ) / team.members.length || 0) : 0;
                  
                  return (
                    <motion.div 
                      key={team._id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                                {team.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{team.name}</h3>
                                {isManager && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Manager</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{team.description || 'No description'}</p>
                          </div>
                        </div>

                        {isStudent && (
                          <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Users className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="text-base sm:text-lg font-bold text-gray-900">{team.members.length}</div>
                              <div className="text-xs text-gray-500">Members</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              </div>
                              <div className="text-base sm:text-lg font-bold text-gray-900">{Math.round(teamAvgProgress)}%</div>
                              <div className="text-xs text-gray-500">Avg Progress</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-1">
                                <Award className="w-4 h-4 text-orange-500" />
                              </div>
                              <div className="text-base sm:text-lg font-bold text-gray-900">
                                {team.members.reduce((sum, m) => sum + (memberProgress[m.user._id]?.completedCourses || 0), 0)}
                              </div>
                              <div className="text-xs text-gray-500">Completed</div>
                            </div>
                          </div>
                        )}

                        {!isStudent && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                            <Users className="w-4 h-4" />
                            <span>{team.members.length} members</span>
                          </div>
                        )}

                        {isStudent ? (
                          <div className="space-y-2 mb-3 sm:mb-4">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Team Members Progress</div>
                            {team.members.slice(0, 3).map((member) => {
                              const progress = memberProgress[member.user._id];
                              return (
                                <div key={member.user._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  {member.user.profilePicture ? (
                                    <img
                                      src={member.user.profilePicture}
                                      alt={`${member.user.firstName} ${member.user.lastName}`}
                                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                      {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-gray-900 truncate">
                                      {member.user.firstName} {member.user.lastName}
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                      <div 
                                        className="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full transition-all"
                                        style={{ width: `${progress?.avgProgress || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="text-xs font-semibold text-gray-700">
                                    {progress?.avgProgress || 0}%
                                  </div>
                                </div>
                              );
                            })}
                            {team.members.length > 3 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{team.members.length - 3} more members
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2 mb-3 sm:mb-4">
                            {team.members
                              .filter(member => team.createdBy._id === member.user._id)
                              .map((member) => (
                              <div key={member.user._id} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                                <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Crown className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {member.user.firstName} {member.user.lastName}
                                  </div>
                                  <div className="text-xs text-orange-600">Creator</div>
                                </div>
                              </div>
                            ))}
                            
                            {team.members.length > 1 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                +{team.members.length - 1} more members
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => navigate(`/teams/${team._id}`)}
                            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium tap-target"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Chat</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teams/${team._id}/meeting`);
                            }}
                            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium tap-target"
                          >
                            <Video className="w-4 h-4" />
                            <span className="hidden sm:inline">Meet</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teams/${team._id}/settings`);
                            }}
                            className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium tap-target"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {isManager && (
                        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddMemberModal(team._id);
                            }}
                            className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 text-xs sm:text-sm font-medium tap-target"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Member
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <CreateTeamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateTeam={handleCreateTeam}
          loading={creating}
        />

        <AddMemberModal
          isOpen={!!showAddMemberModal}
          onClose={() => setShowAddMemberModal(null)}
          availableUsers={showAddMemberModal ? getAvailableUsers(showAddMemberModal) : []}
          onAddMember={handleAddMember}
          loading={addingMember}
        />
      </div>
    </div>
  );
};

export default TeamManagementPage;

