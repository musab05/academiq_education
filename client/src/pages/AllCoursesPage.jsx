import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Courses from "../components/courseComponent/Courses";
import Sidebar from "../components/Sidebar";
import RightFilters from "../components/courseComponent/RightFilters";
import AdminRightSidebar from "../components/courseComponent/AdminRightSidebar";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";

const AllCoursesPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    levels: [],
    ratings: [],
    price: [],
  });
  const [resetTrigger, setResetTrigger] = useState(0);
  const { user } = useSelector((state) => state.user);

  const handleFiltersChange = (newFilters) => {
    console.log(
      "AllCoursesPage - handleFiltersChange called with:",
      newFilters,
    );
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setResetTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    console.log("AllCoursesPage - filters state updated:", filters);
  }, [filters]);

  return (
    <div className="flex bg-gray-50">
      {/* Left Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? "5rem" : "18rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sidebar-scroll sticky top-0 h-screen overflow-y-auto bg-white shadow-lg"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          .sidebar-scroll::-webkit-scrollbar,
          .main-scroll::-webkit-scrollbar,
          .filter-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.div>

      {/* Main Content + Right Sidebar with Header */}
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1">
          <div
            className="main-scroll flex-1 overflow-y-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="p-6">
              <Breadcrumb />
            </div>
            <Courses
              filters={filters}
              onClearFilters={handleClearFilters}
              showAll={true}
            />
          </div>
          <div
            className="filter-scroll w-80 overflow-y-auto bg-white shadow-lg mt-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {user?.role === "student" ? (
              <RightFilters
                onFiltersChange={handleFiltersChange}
                resetTrigger={resetTrigger}
              />
            ) : (
              <AdminRightSidebar />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCoursesPage;
