import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Trophy,
  Settings,
  Target,
  Video,
  ArrowLeft,
  ChevronDown,
  BarChart3,
  BookOpen,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import LOGO from "../../public/images/mainlogo-removebg.png";

const TeamSidebar = ({
  team,
  collapsed = false,
  isOpen = false,
  onClose = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const { user } = useSelector((state) => state.user);

  const isManager = team?.members?.some(
    (m) => m.user?._id === user?._id && m.role === "manager",
  );

  const menuItems = [
    {
      name: "Chat",
      icon: <MessageCircle size={20} />,
      link: `/teams/${team?._id}`,
    },
    {
      name: "Leaderboard",
      icon: <Trophy size={20} />,
      link: `/teams/${team?._id}/leaderboard`,
    },
    {
      name: "Members",
      icon: <Users size={20} />,
      link: `/teams/${team?._id}/members`,
    },
    {
      name: "Goals",
      icon: <Target size={20} />,
      link: `/teams/${team?._id}/goals`,
    },
    {
      name: "Courses",
      icon: <BookOpen size={20} />,
      link: `/teams/${team?._id}/courses`,
    },
    {
      name: "Meetings",
      icon: <Video size={20} />,
      link: `/teams/${team?._id}/meeting`,
    },
    {
      name: "Recordings",
      icon: <Video size={20} />,
      link: `/teams/${team?._id}/recordings`,
    },
    ...(isManager
      ? [
          {
            name: "Settings",
            icon: <Settings size={20} />,
            link: `/teams/${team?._id}/settings`,
          },
        ]
      : []),
  ];

  const isActive = (link) => {
    return location.pathname === link;
  };

  const SidebarContent = ({ isMobile = false }) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <div
        className={`h-full bg-white shadow-lg flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } border-r border-gray-100`}
      >
        {/* Header with Back Button */}
        <div
          className={`flex items-center p-4 border-b border-gray-100 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teams")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            {!isCollapsed && (
              <span className="text-sm font-medium text-gray-600">
                Back to Teams
              </span>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 tap-target"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        {/* Team Info */}
        {team && !isCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: team.color || "#f97316" }}
              >
                {team.avatar || team.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {team.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {team.members?.length || 0} members
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive(item.link)
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => {
                navigate(item.link);
                if (isMobile) onClose();
              }}
            >
              <div
                className={`${
                  isActive(item.link) ? "text-white" : "text-gray-600"
                }`}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.name}</span>
              )}
            </div>
          ))}
        </div>

        {/* Team Stats Footer */}
        {team && !isCollapsed && (
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  {team.stats?.totalXP?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">Team XP</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {team.stats?.lessonsCompleted || 0}
                </p>
                <p className="text-xs text-gray-500">Lessons</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`h-screen transition-all duration-300 flex-shrink-0 ${
          collapsed ? "w-20" : "w-72"
        } hidden lg:block overflow-hidden`}
      >
        <SidebarContent isMobile={false} />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-white z-50 shadow-xl transform transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent isMobile={true} />
      </div>
    </>
  );
};

export default TeamSidebar;
