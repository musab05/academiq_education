import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import CourseCard from "./CourseCard";
import CreateCourseModal from "./CreateCourseModal";
import { courseAPI, categoriesAPI } from "../../services/api";
import {
  setCourses,
  addCourse,
  setLoading,
} from "../../store/slices/courseSlice";
import { updateUser } from "../../store/slices/userSlice";
import { debounce } from "lodash";

const Courses = ({
  filters: externalFilters = {
    categories: [],
    levels: [],
    ratings: [],
    price: [],
  },
  onClearFilters,
  onToggleFilters,
  showAll = false,
}) => {
  console.log("Courses component - externalFilters prop:", externalFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const coursesPerPage = 9;
  const { user, token } = useSelector((state) => state.user);
  const { courses, loading } = useSelector((state) => state.course);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && user) {
      fetchCourses();
    }
  }, [token, user, showAll]);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const fetchCourses = async () => {
    if (!token || !user) return;

    try {
      // Fetch all courses or only user's own courses based on showAll prop
      const response = showAll
        ? await courseAPI.getAllCourses()
        : await courseAPI.getMyCourses();
      dispatch(setCourses(response.data));
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !token || !user) return;

    dispatch(setLoading(true));
    try {
      const response = await courseAPI.createCourse({
        title: courseTitle,
        description: courseDescription,
      });

      dispatch(addCourse(response.data));

      // Check if the user was promoted to instructor
      if (response.data?.roleUpgraded || user.role === "student") {
        dispatch(updateUser({ role: "instructor" }));
      }

      setCourseTitle("");
      setCourseDescription("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const filtered = useMemo(() => {
    console.log("=== FILTERING COURSES ===");
    console.log("External filters:", externalFilters);
    console.log("Total courses:", courses.length);

    return courses.filter((course) => {
      const matchesSearch =
        !debouncedQuery ||
        course.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        course.description
          ?.toLowerCase()
          .includes(debouncedQuery.toLowerCase());

      const matchesCategory =
        !externalFilters?.categories?.length ||
        (course.categories &&
          Array.isArray(course.categories) &&
          course.categories.some((cat) =>
            externalFilters.categories.includes(cat._id || cat),
          ));

      const matchesLevel =
        !externalFilters?.levels?.length ||
        externalFilters.levels.includes(course.level);

      const matchesRating =
        !externalFilters?.ratings?.length ||
        externalFilters.ratings.some((rating) => {
          if (
            !course.reviews ||
            !Array.isArray(course.reviews) ||
            course.reviews.length === 0
          ) {
            return false;
          }
          const avgRating =
            course.reviews.reduce((sum, r) => sum + r.rating, 0) /
            course.reviews.length;
          return avgRating >= rating && avgRating < rating + 1;
        });

      const matchesPrice =
        !externalFilters?.price?.length ||
        externalFilters.price.some((priceType) => {
          if (priceType === "free") return course.price === 0 || !course.price;
          if (priceType === "paid") return course.price > 0;
          return false;
        });

      console.log(
        "Course:",
        course.title,
        "| Search:",
        matchesSearch,
        "| Category:",
        matchesCategory,
        "| Level:",
        matchesLevel,
        "| Rating:",
        matchesRating,
        "| Price:",
        matchesPrice,
      );
      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesRating &&
        matchesPrice
      );
    });
  }, [courses, debouncedQuery, externalFilters]);

  const totalPages = Math.ceil(filtered.length / coursesPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filtered.slice(startIndex, startIndex + coursesPerPage);
  }, [filtered, currentPage, coursesPerPage]);

  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen w-full">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              My Courses
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and create your courses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF5A00] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#ff8f52] flex items-center gap-2 text-sm sm:text-base tap-target"
            >
              <Plus className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Create Course</span>
              <span className="sm:hidden">Create</span>
              {user?.role === "student" && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded text-xs hidden sm:inline">
                  Become Instructor
                </span>
              )}
            </button>

            <div className="relative flex-1 sm:flex-initial">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full sm:w-48 md:w-64 h-10 pl-4 pr-10 rounded-md border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
              <Search
                size={16}
                className="absolute right-3 top-2.5 text-gray-400"
              />
            </div>

            <button
              onClick={onToggleFilters}
              className="lg:hidden bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm tap-target"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setView("grid")}
                className={
                  "p-2 rounded-md tap-target " +
                  (view === "grid"
                    ? "bg-orange-500 text-white"
                    : "border border-gray-100 hover:bg-gray-100")
                }
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setView("list")}
                className={
                  "p-2 rounded-md tap-target " +
                  (view === "list"
                    ? "bg-orange-500 text-white"
                    : "border border-gray-100 hover:bg-gray-100")
                }
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="text-xs sm:text-sm text-gray-600">
            {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first course
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF5A00] text-white px-6 py-3 rounded-lg hover:bg-[#ff8f52] flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" /> Create Your First Course
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8a7.962 7.962 0 01-2 5.291z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 mb-6">
              No courses match your current filters
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCurrentPage(1);
                onClearFilters?.();
              }}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  : "flex flex-col gap-3 sm:gap-4"
              }
            >
              {paginatedCourses.map((course) => (
                <CourseCard
                  key={course._id || course.id}
                  course={course}
                  view={view}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed tap-target"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm tap-target ${
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed tap-target"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseTitle={courseTitle}
        setCourseTitle={setCourseTitle}
        courseDescription={courseDescription}
        setCourseDescription={setCourseDescription}
        onCreateCourse={handleCreateCourse}
        loading={loading}
        isStudent={user?.role === "student"}
      />
    </div>
  );
};

export default Courses;
