import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  DollarSign,
  User,
  Bell,
  ChevronDown,
  Menu,
  X,
  Star,
  LogOut,
  Building2,
  Video,
  Calendar,
  Trash2,
  FileText,
  List,
  Trophy,
} from "lucide-react";
import LOGO from "../public/images/mainlogo-removebg.png";
import { logout } from "../store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";

// Classroom-specific menu config
const classroomMenus = [
  {
    name: "Overview",
    icon: <Video size={20} />,
    link: "/classroom/",
  },
  {
    name: "Sessions",
    icon: <Calendar size={20} />,
    link: "/classroom/sessions",
  },
  {
    name: "Enrollment",
    icon: <User size={20} />,
    subItems: [
      { name: "Students", link: "/classroom/enrollments/students" },
      { name: "Teams", link: "/classroom/enrollments/teams" },
    ],
  },
  {
    name: "Reports",
    icon: <FileText size={20} />,
    subItems: [
      { name: "Attendance", link: "/classroom/reports/attendance" },
      { name: "Engagement", link: "/classroom/reports/engagement" },
    ],
  },
  {
    name: "Recordings",
    icon: <Video size={20} />,
    link: "/classroom/recordings",
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    link: "/classroom/settings",
  },
];

// Course-specific menu config
const courseMenus = [
  {
    name: "Content",
    icon: <BookOpen size={20} />,
    subItems: [
      { name: "Curriculum", link: "/course-overview/" },
      { name: "Settings", link: "/course-overview/settings" },
    ],
  },
  {
    name: "Enrollment",
    icon: <User size={20} />,
    subItems: [
      { name: "Users", link: "/course-overview/enrollments/users" },
      { name: "Teams", link: "/course-overview/enrollments/teams" },
    ],
  },
  {
    name: "Reports",
    icon: <FileText size={20} />,
    subItems: [
      { name: "User Reports", link: "/course-overview/reports/users" },
      { name: "Team Reports", link: "/course-overview/reports/teams" },
      { name: "Course Reports", link: "/course-overview/reports/course" },
      { name: "Assignments", link: "/course-overview/assignments" },
    ],
  },
  {
    name: "Resources",
    icon: <List size={20} />,
    link: "/course-overview/resources",
  },
  {
    name: "Course Settings",
    icon: <Settings size={20} />,
    subItems: [
      { name: "General", link: "/course-overview/settings/general" },
      { name: "Access", link: "/course-overview/settings/access" },
      { name: "Completion", link: "/course-overview/settings/completion" },
      { name: "Certificate", link: "/course-overview/settings/certificate" },
      {
        name: "Notifications",
        link: "/course-overview/settings/notifications",
      },
      { name: "Grading", link: "/course-overview/settings/grading" },
      { name: "Advanced", link: "/course-overview/settings/advanced" },
    ],
  },
  {
    name: "Delete Course",
    icon: <Trash2 size={20} />,
    action: "delete",
  },
];

// Role-based menu config
const menus = {
  student: [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      link: "/dashboard",
    },
    {
      name: "Achievements",
      icon: <Star size={20} />,
      link: "/achievements",
    },
    {
      name: "Leaderboard",
      icon: <Trophy size={20} />,
      link: "/leaderboard",
    },
    {
      name: "Courses",
      icon: <BookOpen size={20} />,
      subItems: [
        { name: "My Courses", link: "/my-courses" },
        { name: "Playlists", link: "/playlists" },
      ],
    },
    {
      name: "Classrooms",
      icon: <Video size={20} />,
      subItems: [
        { name: "My Classrooms", link: "/my-classrooms" },
      ],
    },
    {
      name: "Teams",
      icon: <User size={20} />,
      link: "/teams",
    },
    {
      name: "Institute",
      icon: <Building2 size={20} />,
      link: "/my-institute",
    },
    {
      name: "Events",
      icon: <Bell size={20} />,
      link: "/events",
    },
    {
      name: "Reports",
      icon: <FileText size={20} />,
      link: "/my-reports",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      link: "/settings",
    },
  ],
  instructor: [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      link: "/dashboard",
    },
    {
      name: "Courses",
      icon: <BookOpen size={20} />,
      subItems: [
        { name: "My Courses", link: "/courses" },
        { name: "Create Course", link: "/create-course" },
      ],
    },
    {
      name: "Classrooms",
      icon: <Bell size={20} />,
      link: "/classrooms",
    },
    {
      name: "Departments",
      icon: <Building2 size={20} />,
      link: "/departments",
    },
    {
      name: "Assignments",
      icon: <FileText size={20} />,
      link: "/assignments",
    },
    {
      name: "Earnings",
      icon: <DollarSign size={20} />,
      link: "/earnings",
    },
  ],
  admin: [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      link: "/dashboard",
    },
    {
      name: "User Management",
      icon: <User size={20} />,
      subItems: [
        { name: "All Users", link: "/users" },
        { name: "Instructors", link: "/users/instructor" },
        { name: "Students", link: "/users/student" },
        { name: "Teams", link: "/teams" },
      ],
    },
    {
      name: "Course Management",
      icon: <BookOpen size={20} />,
      subItems: [
        { name: "Courses", link: "/courses" },
        { name: "Categories", link: "/categories" },
      ],
    },
    {
      name: "Classrooms",
      icon: <Video size={20} />,
      subItems: [
        { name: "All Classrooms", link: "/classrooms" },
        { name: "Recordings", link: "/recordings" },
      ],
    },
    {
      name: "Departments",
      icon: <Building2 size={20} />,
      link: "/departments",
    },
    {
      name: "Certificates",
      icon: <Star size={20} />,
      link: "/certificates",
    },
    {
      name: "Events",
      icon: <Bell size={20} />,
      link: "/events",
    },
    {
      name: "Reports",
      icon: <FileText size={20} />,
      subItems: [
        { name: "All Reports", link: "/reports" },
        { name: "Assignments", link: "/assignments" },
      ],
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      link: "/settings",
    },
  ],
  superadmin: [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      link: "/dashboard",
    },
    {
      name: "Institutes",
      icon: <Building2 size={20} />,
      link: "/institutes",
    },
    {
      name: "User Management",
      icon: <User size={20} />,
      subItems: [
        { name: "All Users", link: "/users" },
        { name: "Instructors", link: "/users/instructor" },
        { name: "Students", link: "/users/student" },
        { name: "Teams", link: "/teams" },
      ],
    },
    {
      name: "Course Management",
      icon: <BookOpen size={20} />,
      subItems: [
        { name: "Courses", link: "/courses" },
        { name: "Categories", link: "/categories" },
      ],
    },
    {
      name: "Classrooms",
      icon: <Video size={20} />,
      subItems: [
        { name: "All Classrooms", link: "/classrooms" },
        { name: "Recordings", link: "/recordings" },
      ],
    },
    {
      name: "Departments",
      icon: <Building2 size={20} />,
      link: "/departments",
    },
    {
      name: "Certificates",
      icon: <Star size={20} />,
      link: "/certificates",
    },
    {
      name: "Events",
      icon: <Bell size={20} />,
      link: "/events",
    },
    {
      name: "Reports",
      icon: <FileText size={20} />,
      subItems: [
        { name: "All Reports", link: "/reports" },
        { name: "Assignments", link: "/assignments" },
      ],
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      link: "/settings",
    },
  ],
};

const friendsList = [
  { name: "Prashant", role: "Software Developer", avatar: "P" },
  { name: "Prashant", role: "Software Developer", avatar: "P" },
  { name: "Prashant", role: "Software Developer", avatar: "P" },
];

const Sidebar = ({ collapsed = false, classroomId = null, isOpen = false, onClose = () => {} }) => {
  const currentUser = useSelector((state) => state.user.user);
  const { currentClassroomId: storeClassroomId, currentClassroomData } = useSelector((state) => state.classroom);
  const role = currentUser?.role || 'student';
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const sidebarOpen = isOpen || internalIsOpen;
  const [openMenus, setOpenMenus] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeMenu, setActiveMenu] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses } = useSelector((state) => state.course);
  const { currentCourseId } = useSelector((state) => state.lesson);
  
  const isStudent = role === 'student';
  
  const classroomIdMatch = location.pathname.match(/\/classroom\/([^/]+)/);
  const sessionIdMatch = location.pathname.match(/\/classrooms\/([^/]+)/);
  const sessionAttendanceMatch = location.pathname.match(/\/sessions\/([^/]+)\/attendance/);
  
  // Priority order: Redux store > URL parsing > prop
  // Use Redux store as the primary source of truth for current classroom
  const extractedClassroomId = classroomIdMatch ? classroomIdMatch[1] : null;
  const currentSessionId = sessionIdMatch ? sessionIdMatch[1] : null;
  const currentClassroomId = storeClassroomId || extractedClassroomId || classroomId;

  // Debug logging for session attendance
  if (location.pathname.includes('/sessions/') && location.pathname.includes('/attendance')) {
    console.log('Session attendance page debug:', {
      pathname: location.pathname,
      storeClassroomId,
      extractedClassroomId,
      classroomIdProp: classroomId,
      currentClassroomId,
      sessionAttendanceMatch,
      currentClassroomData: currentClassroomData?.title
    });
  }

  // Determine which menus to show based on current path
  const isCoursePage = location.pathname.includes("/course-overview/");
  const isClassroomPage = (
    location.pathname.includes("/classroom/") || 
    location.pathname.match(/\/classrooms\/[^/]+$/) ||
    location.pathname.includes("/sessions/") ||
    (classroomId && (location.pathname.includes("/session/") || location.pathname.includes("/sessions/")))
  ) && !location.pathname.includes("/live");

  const currentMenus = isClassroomPage ? classroomMenus : isCoursePage ? courseMenus : menus[role] || [];

  useEffect(() => {
    if (isClassroomPage) {
      if (location.pathname.match(/\/classroom\/[^/]+$/)) {
        setActiveMenu("/classroom/");
      } else if (location.pathname.includes("/sessions")) {
        setActiveMenu("/classroom/sessions");
      } else if (location.pathname.includes("/enrollments/students")) {
        setActiveMenu("/classroom/enrollments/students");
        setOpenMenus((prev) => ({ ...prev, Enrollment: true }));
      } else if (location.pathname.includes("/enrollments/teams")) {
        setActiveMenu("/classroom/enrollments/teams");
        setOpenMenus((prev) => ({ ...prev, Enrollment: true }));
      } else if (location.pathname.includes("/reports/attendance")) {
        setActiveMenu("/classroom/reports/attendance");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/reports/engagement")) {
        setActiveMenu("/classroom/reports/engagement");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/session/") && location.pathname.includes("/attendance")) {
        setActiveMenu("/classroom/reports/attendance");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/sessions/") && location.pathname.includes("/attendance")) {
        setActiveMenu("/classroom/reports/attendance");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/recordings")) {
        setActiveMenu("/classroom/recordings");
      } else if (location.pathname.includes("/settings")) {
        setActiveMenu("/classroom/settings");
      } else if (location.pathname.match(/\/classrooms\/[^/]+$/)) {
        setActiveMenu("/classroom/sessions");
      }
    } else if (isCoursePage) {
      if (location.pathname.includes("/enrollments/users")) {
        setActiveMenu("/course-overview/enrollments/users");
        setOpenMenus((prev) => ({ ...prev, Enrollment: true }));
      } else if (location.pathname.includes("/enrollments/teams")) {
        setActiveMenu("/course-overview/enrollments/teams");
        setOpenMenus((prev) => ({ ...prev, Enrollment: true }));
      } else if (location.pathname.includes("/reports/users")) {
        setActiveMenu("/course-overview/reports/users");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/reports/teams")) {
        setActiveMenu("/course-overview/reports/teams");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/reports/course")) {
        setActiveMenu("/course-overview/reports/course");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/assignments")) {
        setActiveMenu("/course-overview/assignments");
        setOpenMenus((prev) => ({ ...prev, Reports: true }));
      } else if (location.pathname.includes("/assignments") || location.pathname.match(/\/assignment\/[^/]+\/grade$/)) {
        setActiveMenu("/course-overview/assignments");
      } else if (location.pathname.includes("/resources")) {
        setActiveMenu("/course-overview/resources");
      } else if (location.pathname.includes("/settings/")) {
        const settingsPath = location.pathname.match(/\/course-overview\/[^/]+\/(settings\/[^/]+)$/)?.[1];
        if (settingsPath) {
          setActiveMenu(`/course-overview/${settingsPath}`);
          setOpenMenus((prev) => ({ ...prev, "Course Settings": true }));
        }
      } else if (location.pathname.includes("/settings")) {
        setActiveMenu("/course-overview/settings");
        setOpenMenus((prev) => ({ ...prev, Content: true }));
      } else if (location.pathname.match(/\/course-overview\/[^/]+$/)) {
        setActiveMenu("/course-overview/");
        setOpenMenus((prev) => ({ ...prev, Content: true }));
      }
    } else {
      if (location.pathname.startsWith("/institutes")) {
        setActiveMenu("/institutes");
      } else if (location.pathname.startsWith("/teams")) {
        setActiveMenu("/teams");
        setOpenMenus((prev) => ({ ...prev, "User Management": true }));
      } else if (location.pathname.startsWith("/departments")) {
        setActiveMenu("/departments");
      } else if (location.pathname.startsWith("/users")) {
        setActiveMenu(location.pathname);
        setOpenMenus((prev) => ({ ...prev, "User Management": true }));
      } else if (location.pathname.startsWith("/categories")) {
        setActiveMenu("/categories");
        setOpenMenus((prev) => ({ ...prev, "Course Management": true }));
      } else if (location.pathname.startsWith("/courses") || location.pathname === "/create") {
        setActiveMenu("/courses");
        setOpenMenus((prev) => ({ ...prev, "Course Management": true }));
      } else if (location.pathname.startsWith("/enrollments")) {
        setActiveMenu(location.pathname);
      } else if (location.pathname === "/reports" || location.pathname.startsWith("/reports/")) {
        setActiveMenu("/reports");
      } else if (location.pathname === "/events") {
        setActiveMenu("/events");
      } else if (location.pathname === "/certificates") {
        setActiveMenu("/certificates");
      } else if (location.pathname === "/recordings") {
        setActiveMenu("/recordings");
        setOpenMenus((prev) => ({ ...prev, Classrooms: true }));
      } else if (location.pathname === "/classrooms") {
        setActiveMenu("/classrooms");
        setOpenMenus((prev) => ({ ...prev, Classrooms: true }));
      } else if (location.pathname === "/dashboard") {
        setActiveMenu("/dashboard");
      } else {
        setActiveMenu(location.pathname);
      }
    }

    currentMenus.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some((sub) => {
          if (sub.link === "/teams" && location.pathname.startsWith("/teams")) return true;
          if (sub.link === "/departments" && location.pathname.startsWith("/departments")) return true;
          if (sub.link === "/users" && location.pathname === "/users") return true;
          if (sub.link === "/users/instructor" && location.pathname === "/users/instructor") return true;
          if (sub.link === "/users/student" && location.pathname === "/users/student") return true;
          if (sub.link === "/courses" && (location.pathname === "/courses" || location.pathname === "/create")) return true;
          if (sub.link === "/categories" && location.pathname === "/categories") return true;
          if (sub.link === "/classrooms" && location.pathname === "/classrooms") return true;
          if (sub.link === "/recordings" && location.pathname === "/recordings") return true;
          if (sub.link.startsWith("/enrollments") && location.pathname.startsWith("/enrollments")) return true;
          if (sub.link.includes("/enrollments/") && location.pathname.includes("/enrollments/")) return true;
          return sub.link === location.pathname;
        });
        if (hasActiveSubItem) {
          setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [location.pathname, currentMenus, isCoursePage, isClassroomPage]);

  const handleDeleteCourse = async () => {
    const currentCourse = courses.find((c) => c._id === currentCourseId);
    if (!currentCourse) return;

    setDeleting(true);
    try {
      const { courseAPI } = await import('../services/api');
      const { setCourses } = await import('../store/slices/courseSlice');
      await courseAPI.delete(currentCourse.slug);
      const updatedCourses = courses.filter(course => course._id !== currentCourseId);
      dispatch(setCourses(updatedCourses));
      navigate('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleNavigation = (link, action) => {
    if (action === 'delete') {
      setShowDeleteModal(true);
      return;
    }
    if (link) {
      let finalLink = link;
      
      if (link.startsWith("/classroom/") && currentClassroomId) {
        finalLink = link.replace("/classroom/", `/classroom/${currentClassroomId}/`);
        if (link === "/classroom/") {
          finalLink = `/classroom/${currentClassroomId}`;
        }
      } else if (link.startsWith("/classroom/") && !currentClassroomId) {
        // Prevent navigation if classroom ID is not available
        console.warn('Classroom ID not available for navigation:', link);
        return;
      }
      
      if (link === "/course-overview/" && currentCourseId) {
        const currentCourse = courses.find((c) => c._id === currentCourseId);
        if (currentCourse) {
          finalLink = `/course-overview/${currentCourse.slug}`;
        }
      }
      if ((link.includes("/course-overview/enrollments/") || link.includes("/course-overview/reports/") || link.includes("/course-overview/settings/") || link.includes("/course-overview/assignments")) && currentCourseId) {
        const currentCourse = courses.find((c) => c._id === currentCourseId);
        if (currentCourse) {
          finalLink = link.replace(
            "/course-overview/",
            `/course-overview/${currentCourse.slug}/`
          );
        }
      }
      navigate(finalLink);
      setActiveMenu(finalLink);
      setInternalIsOpen(false);
      onClose();
    }
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };
  const handleLogout = () => {
    dispatch(logout());
  };

  const SidebarContent = ({ isMobile = false }) => {
    const isCollapsed = isMobile ? false : collapsed;
    
    return (
      <div
        className={`h-full bg-white shadow-lg flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } border-r border-gray-100`}
      >
        {/* Logo & Collapse Button */}
        <div
          className={`flex items-center p-6 border-b border-gray-100 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link to="/" onClick={() => { if (isMobile) { setInternalIsOpen(false); onClose(); } }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img className="w-full" src={LOGO} alt="" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900">Academiq</span>
              )}
            </div>
          </Link>
          {isMobile && (
            <button
              onClick={() => { setInternalIsOpen(false); onClose(); }}
              className="p-2 rounded-lg hover:bg-gray-100 tap-target"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

      <div
        className="sidebar-content flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          .sidebar-content::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Menu Items */}
        <div className="px-4 pt-2 space-y-1">
          {currentMenus.map((item, idx) => (
            <div key={idx}>
              {/* Parent Item */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  activeMenu === item.link ||
                  (item.link === "/teams" &&
                    location.pathname.startsWith("/teams")) ||
                  (item.link === "/departments" &&
                    location.pathname.startsWith("/departments")) ||
                  (item.name === "Enrollments" &&
                    location.pathname.startsWith("/enrollments"))
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() =>
                  item.subItems
                    ? toggleMenu(item.name)
                    : handleNavigation(item.link, item.action)
                }
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`${
                      activeMenu === item.link ||
                      (item.link === "/teams" &&
                        location.pathname.startsWith("/teams")) ||
                      (item.link === "/departments" &&
                        location.pathname.startsWith("/departments")) ||
                      (item.name === "Enrollments" &&
                        location.pathname.startsWith("/enrollments"))
                        ? "text-orange-600" : "text-gray-600"
                    } group-hover:scale-110 transition-transform duration-200`}
                  >
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </div>
                {item.subItems && !isCollapsed && (
                  <div
                    className={`transition-transform duration-200 ${
                      openMenus[item.name] ? "rotate-180" : "rotate-0"
                    } ${
                      activeMenu === item.link ||
                      (item.link === "/teams" &&
                        location.pathname.startsWith("/teams")) ||
                      (item.link === "/departments" &&
                        location.pathname.startsWith("/departments")) ||
                      (item.name === "Enrollments" &&
                        location.pathname.startsWith("/enrollments"))
                        ? "text-orange-600" : "text-gray-400"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                )}
              </div>

              {/* Submenu */}
              {item.subItems && openMenus[item.name] && !isCollapsed && (
                <div className="ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300">
                  {item.subItems.map((sub, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center space-x-2 ${
                        activeMenu === sub.link ||
                        (sub.link === "/teams" &&
                          location.pathname.startsWith("/teams")) ||
                        (sub.link === "/departments" &&
                          location.pathname.startsWith("/departments")) ||
                        (sub.link.startsWith("/enrollments") &&
                          location.pathname.startsWith("/enrollments")) ||
                        (sub.link.includes("/enrollments/users") &&
                          location.pathname.includes("/enrollments/users")) ||
                        (sub.link.includes("/enrollments/teams") &&
                          location.pathname.includes("/enrollments/teams")) ||
                        (sub.link.includes("/reports/users") &&
                          location.pathname.includes("/reports/users")) ||
                        (sub.link.includes("/reports/teams") &&
                          location.pathname.includes("/reports/teams")) ||
                        (sub.link.includes("/reports/course") &&
                          location.pathname.includes("/reports/course")) ||
                        (sub.link.includes("/assignments") &&
                          location.pathname.includes("/assignments"))
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => handleNavigation(sub.link)}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activeMenu === sub.link ||
                          (sub.link === "/teams" &&
                            location.pathname.startsWith("/teams")) ||
                          (sub.link === "/departments" &&
                            location.pathname.startsWith("/departments")) ||
                          (sub.link.startsWith("/enrollments") &&
                            location.pathname.startsWith("/enrollments")) ||
                          (sub.link.includes("/enrollments/users") &&
                            location.pathname.includes("/enrollments/users")) ||
                          (sub.link.includes("/enrollments/teams") &&
                            location.pathname.includes("/enrollments/teams"))
                            ? "bg-orange-600"
                            : "bg-orange-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Friends Section */}
        {!isCollapsed && (
          <div className="px-6 py-4 mt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              FRIENDS
            </h3>
            <div className="space-y-3">
              {friendsList.map((friend, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: "#FF5A00" }}
                  >
                    {friend.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {friend.name}
                    </p>
                    <p className="text-xs text-gray-500">{friend.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="border-t border-gray-100 p-4 mt-auto">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            SETTINGS
          </h3>
        )}
        <div className="space-y-1">
          <div className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
            <Settings size={20} className="text-gray-600" />
            {!isCollapsed && (
              <span className="font-medium text-sm">Settings</span>
            )}
          </div>
          <div
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-200"
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Course?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                  deleting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                } transition-colors`}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : (
                  'Yes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => { setInternalIsOpen(false); onClose(); }}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`h-screen transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } hidden lg:block`}
      >
        <SidebarContent isMobile={false} />
      </div>
      
      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-white z-50 shadow-xl transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile={true} />
      </div>
    </>
  );
};

export default Sidebar;
