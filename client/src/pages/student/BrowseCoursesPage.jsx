import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Clock,
  BarChart,
  BookOpen,
  Play,
  Users,
  Star,
  Filter,
  X,
  GraduationCap,
} from "lucide-react";
import AddToPlaylistButton from "../../components/playlist/AddToPlaylistButton";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import RightFilters from "../../components/courseComponent/RightFilters";
import { courseAPI, playlistAPI } from "../../services/api";
import { useNotification } from "../../context/NotificationContext";
import { setCurrentCourse } from "../../store/slices/lessonSlice";
import { pushNavigation } from "../../store/slices/navigationSlice";
import thumbnail from "../../public/images/thumbnail.jpg";
import { debounce } from "lodash";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const BrowseCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    levels: [],
    ratings: [],
    price: [],
  });
  const [filterReset, setFilterReset] = useState(0);
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  useEffect(() => {
    fetchAllCourses();
    fetchPlaylists();
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

  const fetchAllCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error("Error fetching playlists:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId, courseId, e) => {
    e.stopPropagation();
    try {
      await playlistAPI.addCourse(playlistId, courseId);
      showNotification({ type: "success", message: "Added to playlist" });
      setShowPlaylistMenu(null);
    } catch (error) {
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to add to playlist",
      });
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !debouncedQuery ||
        course.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(debouncedQuery.toLowerCase());

      const matchesCategory =
        filters.categories.length === 0 ||
        (course.categories &&
          course.categories.some((cat) =>
            filters.categories.includes(cat._id || cat),
          ));

      const matchesLevel =
        filters.levels.length === 0 || filters.levels.includes(course.level);

      const matchesRating =
        filters.ratings.length === 0 ||
        filters.ratings.some((rating) => {
          if (!course.reviews || course.reviews.length === 0) return false;
          const avgRating =
            course.reviews.reduce((sum, r) => sum + r.rating, 0) /
            course.reviews.length;
          return avgRating >= rating && avgRating < rating + 1;
        });

      const matchesPrice =
        filters.price.length === 0 ||
        filters.price.some((priceType) => {
          if (priceType === "free") return !course.price || course.price === 0;
          if (priceType === "paid") return course.price && course.price > 0;
          return true;
        });

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesRating &&
        matchesPrice
      );
    });
  }, [courses, debouncedQuery, filters]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage, coursesPerPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ categories: [], levels: [], ratings: [], price: [] });
    setCurrentPage(1);
    setFilterReset((prev) => prev + 1);
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-orange-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100/40 to-yellow-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg shadow-orange-100/50 border border-orange-100 mb-4"
            >
              <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Explore Our Courses
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent">
                Course
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 max-w-2xl mx-auto mb-8"
            >
              Browse through our extensive collection of courses and start your
              learning journey today
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for courses..."
                className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border-2 border-gray-100 shadow-xl shadow-gray-100/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100 transition-all"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {courses.length}+
              </div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-sm text-gray-500">Instructors</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-500">Students</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Course Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {filteredCourses.length}
                    </span>{" "}
                    courses found
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1">
                    <button
                      onClick={() => setView("grid")}
                      className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`p-2 rounded-lg transition-all hidden sm:flex ${view === "list" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-gray-700 hover:border-orange-300 transition-all"
                  >
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filters</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500">Loading courses...</p>
                  </div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 bg-white rounded-2xl border border-gray-100"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <>
                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "flex flex-col gap-4"
                    }
                  >
                    {paginatedCourses.map((course, index) => (
                      <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -6 }}
                        className={`group bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 relative ${view === "list" ? "hidden sm:flex" : ""}`}
                        onClick={() => {
                          dispatch(setCurrentCourse(course._id));
                          dispatch(pushNavigation("/all-courses"));
                          navigate(`/course-preview/${course.slug}`);
                        }}
                      >
                        <div
                          className={`relative ${view === "list" ? "w-64 flex-shrink-0" : ""}`}
                        >
                          <img
                            src={course.thumbnail || thumbnail}
                            alt={course.title}
                            className={`object-cover ${view === "list" ? "w-full h-full" : "w-full h-44"}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {course.category && (
                            <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
                              {course.category}
                            </span>
                          )}
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 text-orange-500 fill-orange-500 ml-0.5" />
                            </div>
                          </div>
                        </div>

                        <div className="p-5 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={
                                course.instructor?.profilePicture ||
                                `https://ui-avatars.com/api/?name=${course.instructor?.firstName}+${course.instructor?.lastName}&background=FF5A00&color=fff`
                              }
                              alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-100"
                            />
                            <span className="text-sm font-medium text-gray-600">
                              {course.instructor?.firstName}{" "}
                              {course.instructor?.lastName}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                            {course.title}
                          </h3>

                          <p
                            className={`text-sm text-gray-500 leading-relaxed mb-4 ${view === "grid" ? "line-clamp-2" : "line-clamp-3"}`}
                          >
                            {course.description || "No description available"}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{course.lessons?.length || 0} lessons</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>
                                {course.enrollmentCount || 0} students
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AddToPlaylistButton
                            courseId={course._id}
                            compact={true}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="p-3 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let page;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[44px] h-11 px-4 rounded-xl text-sm font-semibold transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        },
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="p-3 rounded-xl bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-8 bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-orange-500" />
                    Filters
                  </h3>
                </div>
                <RightFilters
                  onFiltersChange={handleFiltersChange}
                  resetTrigger={filterReset}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RightFilters
              onFiltersChange={handleFiltersChange}
              resetTrigger={filterReset}
            />
          </motion.div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default BrowseCoursesPage;
