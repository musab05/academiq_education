import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import LOGO from "../public/images/mainlogo-removebg.png";

const courseMenus = [
  {
    name: "Content",
    icon: <BookOpen size={20} />,
    subItems: [
      { name: "Curriculum", link: "/course/:id/curriculum" },
      { name: "Overview", link: "/course/:id/overview" },
    ],
  },
  {
    name: "Enrollment",
    icon: <Users size={20} />,
    subItems: [
      { name: "Learners", link: "/course/:id/learners" },
      { name: "Teams", link: "/course/:id/teams" },
    ],
  },
  {
    name: "Reports",
    icon: <BarChart3 size={20} />,
    subItems: [
      { name: "User Reports", link: "/course-overview/:id/reports/users" },
      { name: "Course Reports", link: "/course-overview/:id/reports/course" },
      { name: "Assignments", link: "/assignment/:id/grade" },
    ],
  },
  {
    name: "Resources",
    icon: <FileText size={20} />,
    link: "/course/:id/resources",
  },
  {
    name: "Course Settings",
    icon: <Settings size={20} />,
    subItems: [
      { name: "General", link: "/course/:id/settings/general" },
      { name: "Access", link: "/course/:id/settings/access" },
      { name: "Completion", link: "/course/:id/settings/completion" },
      { name: "Notifications", link: "/course/:id/settings/notifications" },
      { name: "Grading", link: "/course/:id/settings/grading" },
      { name: "Advanced", link: "/course/:id/settings/advanced" },
    ],
  },
];

const CourseSidebar = ({ courseId, collapsed = false, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [activeMenu, setActiveMenu] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveMenu(location.pathname);
    
    // Open parent menu if current path matches a submenu item
    courseMenus.forEach(item => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(sub => 
          sub.link.replace(':id', courseId) === location.pathname
        );
        if (hasActiveSubItem) {
          setOpenMenus(prev => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [location.pathname, courseId]);

  const handleNavigation = (link) => {
    if (link) {
      const finalLink = link.replace(':id', courseId);
      setActiveMenu(finalLink);
      navigate(finalLink);
      setIsOpen(false);
    }
  };

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const SidebarContent = () => (
    <div className={`h-full bg-white shadow-lg flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'} border-r border-gray-100`}>
      {/* Logo & Collapse Button */}
      <div className={`flex items-center p-6 border-b border-gray-100 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
            <img className="w-full" src={LOGO} alt="" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">
              Course
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors duration-200 hidden md:block"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Course Menu Items */}
        <div className="px-4 pt-6 space-y-1">
          {courseMenus.map((item, idx) => (
            <div key={idx}>
              {/* Parent Item */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  activeMenu === item.link?.replace(':id', courseId) ? 'text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
                style={activeMenu === item.link?.replace(':id', courseId) ? { backgroundColor: '#FF5A00' } : {}}
                onClick={() => item.subItems ? toggleMenu(item.name) : handleNavigation(item.link)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${activeMenu === item.link?.replace(':id', courseId) ? 'text-white' : 'text-gray-600'} group-hover:scale-110 transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </div>
                {item.subItems && !collapsed && (
                  <div
                    className={`transition-transform duration-200 ${openMenus[item.name] ? 'rotate-180' : 'rotate-0'} ${activeMenu === item.link?.replace(':id', courseId) ? 'text-white' : 'text-gray-400'}`}
                  >
                    <ChevronDown size={16} />
                  </div>
                )}
              </div>

              {/* Submenu */}
              {item.subItems && openMenus[item.name] && !collapsed && (
                <div className="ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300">
                  {item.subItems.map((sub, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center space-x-2 ${
                        activeMenu === sub.link.replace(':id', courseId) ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => handleNavigation(sub.link)}
                    >
                      <div className={`w-2 h-2 rounded-full ${activeMenu === sub.link.replace(':id', courseId) ? 'bg-orange-600' : 'bg-orange-500'}`}></div>
                      <span className="text-sm font-medium">{sub.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        <Menu size={24} className="text-gray-600" />
      </button>

      {/* Desktop Sidebar */}
      <div className={`hidden md:block h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`fixed top-0 left-0 w-72 h-full bg-white z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <span className="text-xl font-bold text-gray-900">Course</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}
    </div>
  );
};

export default CourseSidebar;