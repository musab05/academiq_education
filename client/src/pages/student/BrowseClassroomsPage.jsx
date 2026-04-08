import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Video,
  Calendar,
  Users,
  Search,
  Grid,
  List,
  ArrowRight,
  Play,
  Clock,
} from "lucide-react";
import { classroomManagementAPI } from "../../services/api";

import { debounce } from "lodash";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const BrowseClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const classroomsPerPage = 12;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllClassrooms();
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const fetchAllClassrooms = async () => {
    try {
      const response = await classroomManagementAPI.getAllPublic();
      setClassrooms(response.data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClassroom = (classroom) => {
    navigate(`/classroom-preview/${classroom._id}`);
  };

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((classroom) => {
      // Apply search filter
      if (!debouncedQuery) return true;
      return (
        classroom.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        classroom.description
          ?.toLowerCase()
          .includes(debouncedQuery.toLowerCase())
      );
    });
  }, [classrooms, debouncedQuery]);

  const totalPages = Math.ceil(filteredClassrooms.length / classroomsPerPage);
  const paginatedClassrooms = useMemo(() => {
    const startIndex = (currentPage - 1) * classroomsPerPage;
    return filteredClassrooms.slice(startIndex, startIndex + classroomsPerPage);
  }, [filteredClassrooms, currentPage, classroomsPerPage]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-orange-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100/40 to-yellow-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg shadow-orange-100/50 border border-orange-100 mb-6"
          >
            <Play className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">
              Live Learning Sessions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Browse{" "}
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Live Classrooms
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Join interactive live sessions with expert instructors. Learn in
            real-time, ask questions, and collaborate with fellow students.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search classrooms..."
                className="w-full h-14 pl-6 pr-14 rounded-2xl border-2 border-gray-200 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Search size={20} className="text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12 sm:py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                Available Classrooms
              </h2>
              <p className="text-sm text-gray-500">
                {filteredClassrooms.length} classroom
                {filteredClassrooms.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("grid")}
                className={`p-2.5 rounded-xl transition-all ${
                  view === "grid"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2.5 rounded-xl hidden sm:flex transition-all ${
                  view === "list"
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-500">Loading classrooms...</p>
            </div>
          ) : filteredClassrooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-3xl border border-gray-100"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Video className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No classrooms found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search or check back later for new sessions.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <>
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {paginatedClassrooms.map((classroom, index) => (
                  <motion.div
                    key={classroom._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className={`group bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 ${view === "list" ? "hidden sm:flex" : ""}`}
                    onClick={() => handleOpenClassroom(classroom)}
                  >
                    <div
                      className={`relative ${view === "list" ? "w-64 flex-shrink-0" : ""}`}
                    >
                      <div
                        className={`bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center ${view === "list" ? "w-full h-full min-h-[160px]" : "w-full h-44"}`}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150" />
                          <Video className="w-12 h-12 text-white relative z-10" />
                        </div>
                      </div>
                      {/* Live Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-gray-700">
                          Live
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                        {classroom.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {classroom.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-2 text-orange-400" />
                          {classroom.enrolledStudents?.length || 0} students
                          enrolled
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                          {classroom.instructor?.firstName}{" "}
                          {classroom.instructor?.lastName}
                        </div>
                      </div>

                      <button className="w-full flex items-center justify-center gap-2 bg-gray-50 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-red-500 text-gray-700 group-hover:text-white py-2.5 rounded-xl font-medium transition-all duration-300">
                        <span>View Classroom</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrowseClassroomsPage;
