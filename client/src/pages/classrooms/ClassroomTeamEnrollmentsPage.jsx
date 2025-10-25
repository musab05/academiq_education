import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { UsersRound, Plus, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomManagementAPI, teamAPI } from '../../services/api';
import TeamSelector from '../../components/department/TeamSelector';

const ClassroomTeamEnrollmentsPage = () => {
  const { classroomId } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [teams, setTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchClassroom();
    fetchAllTeams();
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const response = await classroomManagementAPI.getAll();
      const found = response.data.find(c => c._id === classroomId);
      setClassroom(found);
      
      if (found?.enrolledTeams) {
        const teamResponse = await teamAPI.getTeams();
        const enrolledTeams = teamResponse.data.filter(t => found.enrolledTeams.includes(t._id));
        setTeams(enrolledTeams);
      }
    } catch (error) {
      console.error('Error fetching classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTeams = async () => {
    try {
      const response = await teamAPI.getTeams();
      setAllTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleEnroll = async () => {
    if (!selectedTeam) return;
    try {
      await classroomManagementAPI.enrollTeam(classroomId, { teamId: selectedTeam });
      setShowAddModal(false);
      setSelectedTeam('');
      fetchClassroom();
    } catch (error) {
      console.error('Error enrolling team:', error);
    }
  };

  const handleUnenroll = async (teamId) => {
    if (!window.confirm('Remove this team from the classroom?')) return;
    try {
      await classroomManagementAPI.unenrollTeam(classroomId, teamId);
      fetchClassroom();
    } catch (error) {
      console.error('Error unenrolling team:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => {
          setSidebarCollapsed(!sidebarCollapsed);
          setSidebarOpen(!sidebarOpen);
        }} />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Team Enrollments</h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">{classroom?.title}</p>
              </div>
              {currentUser?.role !== 'student' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="tap-target w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Enroll Team
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Members</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Department</th>
                      {currentUser?.role !== 'student' && (
                        <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teams.map((team) => (
                      <tr key={team._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-gray-900 text-sm sm:text-base">{team.name}</div>
                          <div className="text-xs text-gray-500 md:hidden mt-1">{team.members?.length || 0} members</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm hidden md:table-cell">{team.members?.length || 0} members</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm hidden lg:table-cell">{team.department?.name || 'N/A'}</td>
                        {currentUser?.role !== 'student' && (
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                            <button 
                              onClick={() => handleUnenroll(team._id)}
                              className="tap-target text-red-600 hover:text-red-700 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {teams.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <UsersRound className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No teams enrolled yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Enroll Team</h2>
            <TeamSelector
              teams={allTeams.filter(t => !classroom?.enrolledTeams?.includes(t._id))}
              selected={selectedTeam}
              onSelect={setSelectedTeam}
              placeholder="Select a team"
            />
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="tap-target w-full sm:flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={!selectedTeam}
                className="tap-target w-full sm:flex-1 px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-sm sm:text-base"
              >
                Enroll
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassroomTeamEnrollmentsPage;
