import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Zap,
  Trophy,
  X,
} from "lucide-react";
import TeamSidebar from "../components/team/TeamSidebar";
import Header from "../components/Header";
import { teamAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const TeamGoalsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    targetValue: 100,
    type: "xp",
    deadline: "",
  });

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const teamsRes = await teamAPI.getTeams();
      const foundTeam = teamsRes.data.find((t) => t._id === teamId);
      setTeam(foundTeam);
    } catch (error) {
      console.error("Error fetching team data:", error);
      showNotification({ type: "error", message: "Failed to load team goals" });
    } finally {
      setLoading(false);
    }
  };

  const isManager =
    team?.members.find((m) => m.user._id === user._id)?.role === "manager" ||
    team?.createdBy?._id === user._id;

  const handleAddGoal = async () => {
    if (!goalForm.title.trim()) {
      showNotification({ type: "error", message: "Please enter a goal title" });
      return;
    }

    try {
      setSaving(true);
      await teamAPI.addGoal(teamId, goalForm);
      showNotification({ type: "success", message: "Goal added successfully" });
      setShowAddGoalModal(false);
      setGoalForm({
        title: "",
        description: "",
        targetValue: 100,
        type: "xp",
        deadline: "",
      });
      fetchTeamData();
    } catch (error) {
      console.error("Error adding goal:", error);
      showNotification({ type: "error", message: "Failed to add goal" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !goalForm.title.trim()) return;

    try {
      setSaving(true);
      await teamAPI.updateGoal(teamId, editingGoal, goalForm);
      showNotification({
        type: "success",
        message: "Goal updated successfully",
      });
      setEditingGoal(null);
      setGoalForm({
        title: "",
        description: "",
        targetValue: 100,
        type: "xp",
        deadline: "",
      });
      fetchTeamData();
    } catch (error) {
      console.error("Error updating goal:", error);
      showNotification({ type: "error", message: "Failed to update goal" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Delete this goal?")) return;

    try {
      await teamAPI.deleteGoal(teamId, goalId);
      showNotification({
        type: "success",
        message: "Goal deleted successfully",
      });
      fetchTeamData();
    } catch (error) {
      console.error("Error deleting goal:", error);
      showNotification({ type: "error", message: "Failed to delete goal" });
    }
  };

  const openEditModal = (goal) => {
    setGoalForm({
      title: goal.title,
      description: goal.description || "",
      targetValue: goal.targetValue,
      type: goal.type,
      deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
    });
    setEditingGoal(goal._id);
  };

  const closeModal = () => {
    setShowAddGoalModal(false);
    setEditingGoal(null);
    setGoalForm({
      title: "",
      description: "",
      targetValue: 100,
      type: "xp",
      deadline: "",
    });
  };

  const getGoalTypeIcon = (type) => {
    switch (type) {
      case "xp":
        return Zap;
      case "lessons":
        return Target;
      case "courses":
        return Trophy;
      default:
        return Target;
    }
  };

  const getGoalProgress = (goal) => {
    return Math.min(
      100,
      Math.round((goal.currentValue / goal.targetValue) * 100),
    );
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0)
      return { text: "Overdue", color: "text-red-500", bg: "bg-red-100" };
    if (days === 0)
      return {
        text: "Due today",
        color: "text-orange-500",
        bg: "bg-orange-100",
      };
    if (days <= 7)
      return {
        text: `${days} days left`,
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return {
      text: `${days} days left`,
      color: "text-green-600",
      bg: "bg-green-100",
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Team not found
          </h2>
          <button
            onClick={() => navigate("/teams")}
            className="text-orange-600 hover:text-orange-700"
          >
            Go back to teams
          </button>
        </div>
      </div>
    );
  }

  const goals = team.goals || [];
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const activeGoals = goals.filter((g) => !g.isCompleted).length;

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-orange-50/30 min-h-screen">
      <TeamSidebar
        team={team}
        isManager={isManager}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/teams/${teamId}`)}
                  className="p-2 hover:bg-white rounded-lg transition-colors lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Target className="w-8 h-8 text-orange-500" />
                    Team Goals
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Track and achieve goals together
                  </p>
                </div>
              </div>
              {isManager && (
                <button
                  onClick={() => setShowAddGoalModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Goal</span>
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.length}
                </p>
                <p className="text-sm text-gray-500">Total Goals</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {activeGoals}
                </p>
                <p className="text-sm text-gray-500">In Progress</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {completedGoals}
                </p>
                <p className="text-sm text-gray-500">Completed</p>
              </motion.div>
            </div>

            {/* Goals List */}
            {goals.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                  <Target className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No goals yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create goals to track your team's progress
                </p>
                {isManager && (
                  <button
                    onClick={() => setShowAddGoalModal(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium"
                  >
                    Create First Goal
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {goals.map((goal, index) => {
                    const progress = getGoalProgress(goal);
                    const IconComponent = getGoalTypeIcon(goal.type);
                    const deadlineStatus = getDeadlineStatus(goal.deadline);

                    return (
                      <motion.div
                        key={goal._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all ${
                          goal.isCompleted
                            ? "border-green-200"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  goal.isCompleted
                                    ? "bg-green-100"
                                    : goal.type === "xp"
                                      ? "bg-orange-100"
                                      : goal.type === "lessons"
                                        ? "bg-blue-100"
                                        : "bg-purple-100"
                                }`}
                              >
                                {goal.isCompleted ? (
                                  <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                  <IconComponent
                                    className={`w-6 h-6 ${
                                      goal.type === "xp"
                                        ? "text-orange-500"
                                        : goal.type === "lessons"
                                          ? "text-blue-500"
                                          : "text-purple-500"
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3
                                    className={`font-semibold ${goal.isCompleted ? "text-green-700" : "text-gray-900"}`}
                                  >
                                    {goal.title}
                                  </h3>
                                  {goal.isCompleted && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      Completed
                                    </span>
                                  )}
                                  {deadlineStatus && !goal.isCompleted && (
                                    <span
                                      className={`text-xs ${deadlineStatus.bg} ${deadlineStatus.color} px-2 py-0.5 rounded-full`}
                                    >
                                      {deadlineStatus.text}
                                    </span>
                                  )}
                                </div>
                                {goal.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {goal.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {goal.currentValue} / {goal.targetValue}{" "}
                                    {goal.type === "xp" ? "XP" : goal.type}
                                  </span>
                                  {goal.deadline && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(
                                        goal.deadline,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isManager && !goal.isCompleted && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditModal(goal)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-400" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGoal(goal._id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">
                                Progress
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  goal.isCompleted
                                    ? "text-green-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {progress}%
                              </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  goal.isCompleted
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : "bg-gradient-to-r from-orange-400 to-red-500"
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      <AnimatePresence>
        {(showAddGoalModal || editingGoal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingGoal ? "Edit Goal" : "Add New Goal"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g., Earn 1000 XP this week"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Add more details about this goal..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal Type
                    </label>
                    <select
                      value={goalForm.type}
                      onChange={(e) =>
                        setGoalForm((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    >
                      <option value="xp">XP Points</option>
                      <option value="lessons">Lessons</option>
                      <option value="courses">Courses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      value={goalForm.targetValue}
                      onChange={(e) =>
                        setGoalForm((prev) => ({
                          ...prev,
                          targetValue: parseInt(e.target.value) || 0,
                        }))
                      }
                      min={1}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline (optional)
                  </label>
                  <input
                    type="date"
                    value={goalForm.deadline}
                    onChange={(e) =>
                      setGoalForm((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={editingGoal ? handleUpdateGoal : handleAddGoal}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-sm hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingGoal
                      ? "Update Goal"
                      : "Add Goal"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamGoalsPage;
