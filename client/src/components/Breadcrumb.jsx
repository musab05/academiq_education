import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, ChevronRight } from "lucide-react";

const Breadcrumb = () => {
  const location = useLocation();
  const params = useParams();
  const { currentTeam } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.user);

  // Define breadcrumb mappings for different routes
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [{ name: "Home", path: "/", icon: <Home size={16} /> }];

    // Course overview pages
    if (path.includes("/course-overview/")) {
      breadcrumbs.push({ name: "Courses", path: "/courses" });

      const slug = params.slug;
      const courseOverviewPath = slug ? `/course-overview/${slug}` : path;

      if (path.includes("/enrollments/users")) {
        breadcrumbs.push({
          name: "User Enrollments",
          path: path,
        });
      } else if (path.includes("/enrollments/teams")) {
        breadcrumbs.push({
          name: "Team Enrollments",
          path: path,
        });
      } else if (path.includes("/reports/users") && !path.match(/\/reports\/users\/[^/]+$/)) {
        breadcrumbs.push({ name: "Reports", path: courseOverviewPath });
        breadcrumbs.push({ name: "User Reports", path: path });
      } else if (path.match(/\/reports\/users\/[^/]+$/)) {
        const userReportsPath = path.substring(0, path.lastIndexOf('/'));
        breadcrumbs.push({ name: "Reports", path: courseOverviewPath });
        breadcrumbs.push({ name: "User Reports", path: userReportsPath });
        breadcrumbs.push({ name: "User Details", path: path });
      } else if (path.includes("/reports/teams") && !path.match(/\/reports\/teams\/[^/]+$/)) {
        breadcrumbs.push({ name: "Reports", path: courseOverviewPath });
        breadcrumbs.push({ name: "Team Reports", path: path });
      } else if (path.match(/\/reports\/teams\/[^/]+$/)) {
        const teamReportsPath = path.substring(0, path.lastIndexOf('/'));
        breadcrumbs.push({ name: "Reports", path: courseOverviewPath });
        breadcrumbs.push({ name: "Team Reports", path: teamReportsPath });
        breadcrumbs.push({ name: "Team Details", path: path });
      } else if (path.includes("/reports/course")) {
        breadcrumbs.push({ name: "Reports", path: courseOverviewPath });
        breadcrumbs.push({ name: "Course Reports", path: path });
      } else if (path.match(/\/reports\/lesson\/[^/]+$/)) {
        const courseReportsPath = path.substring(0, path.lastIndexOf('/lesson'));
        breadcrumbs.push({ name: "Reports", path: courseOverviewPath });
        breadcrumbs.push({ name: "Course Reports", path: courseReportsPath });
        breadcrumbs.push({ name: "Lesson Details", path: path });
      } else if (path.includes("/assignments")) {
        breadcrumbs.push({ name: "Course Overview", path: courseOverviewPath });
        breadcrumbs.push({ name: "Assignments", path: path });
      } else if (path.match(/\/course-overview\/[^/]+\/settings\/certificate$/)) {
        const slug = params.slug;
        const courseOverviewPath = `/course-overview/${slug}`;
        breadcrumbs.push({ name: "Course Overview", path: courseOverviewPath });
        breadcrumbs.push({ name: "Course Settings", path: courseOverviewPath });
        breadcrumbs.push({ name: "Certificate", path: path });
      } else if (path.match(/\/course-overview\/[^/]+\/settings$/)) {
        const slug = params.slug;
        const courseOverviewPath = `/course-overview/${slug}`;
        breadcrumbs.push({ name: "Course Overview", path: courseOverviewPath });
        breadcrumbs.push({ name: "Settings", path: path });
      } else if (path.includes("/resources")) {
        breadcrumbs.push({ name: "Resources", path: path });
      } else if (path.includes("/settings")) {
        breadcrumbs.push({ name: "Settings", path: path });
      } else {
        breadcrumbs.push({ name: "Curriculum", path: path });
      }
    }
    // Course creation/management pages
    else if (path === "/create") {
      breadcrumbs.push({ name: "Courses", path: "/courses" });
      breadcrumbs.push({ name: "Create Course", path: "/create" });
    }
    // Regular course pages
    else if (path === "/courses" || path === "/course") {
      breadcrumbs.push({ name: "Courses", path: "/courses" });
    }
    // User management
    if (path === "/users") {
      breadcrumbs.push({ name: "User Management", path: "/users" });
      breadcrumbs.push({ name: "All Users", path: "/users" });
    } else if (path === "/users/instructor") {
      breadcrumbs.push({ name: "User Management", path: "/users" });
      breadcrumbs.push({ name: "Instructors", path: "/users/instructor" });
    } else if (path === "/users/student") {
      breadcrumbs.push({ name: "User Management", path: "/users" });
      breadcrumbs.push({ name: "Students", path: "/users/student" });
    } else if (path === "/teams" || path.startsWith("/teams/")) {
      if (user?.role !== 'student') {
        breadcrumbs.push({ name: "User Management", path: "/users" });
      }
      breadcrumbs.push({ name: "Teams", path: "/teams" });

      // If we're on a specific team page, add that to the breadcrumb
      if (path.startsWith("/teams/") && (params.teamId || params.id)) {
        const teamName = currentTeam?.name || "Team Details";
        breadcrumbs.push({ name: teamName, path: path });
      }
    } else if (path === "/departments") {
      breadcrumbs.push({ name: "User Management", path: "/users" });
      breadcrumbs.push({ name: "Departments", path: "/departments" });
    } else if (path === "/events") {
      breadcrumbs.push({ name: "Events", path: "/events" });
    }
    // Enrollments
    else if (path === "/enrollments/users") {
      breadcrumbs.push({ name: "Enrollments", path: "/enrollments" });
      breadcrumbs.push({
        name: "User Enrollments",
        path: "/enrollments/users",
      });
    } else if (path === "/enrollments/teams") {
      breadcrumbs.push({ name: "Enrollments", path: "/enrollments" });
      breadcrumbs.push({
        name: "Team Enrollments",
        path: "/enrollments/teams",
      });
    }
    // Course management
    else if (path === "/categories") {
      breadcrumbs.push({ name: "Course Management", path: "/courses" });
      breadcrumbs.push({ name: "Categories", path: "/categories" });
    } else if (path === "/course-overview-demo") {
      breadcrumbs.push({ name: "Course Management", path: "/courses" });
      breadcrumbs.push({ name: "Overview", path: "/course-overview-demo" });
    } else if (path.includes("/course-settings/")) {
      breadcrumbs.push({ name: "Courses", path: "/courses" });
      breadcrumbs.push({ name: "Course Overview", path: path });
    }
    // Global reports
    else if (path === "/reports" && !path.includes("/course/") && !path.includes("/user/")) {
      breadcrumbs.push({ name: "Reports", path: "/reports" });
    } else if (path.match(/\/reports\/course\/[^/]+$/)) {
      breadcrumbs.push({ name: "Reports", path: "/reports" });
      breadcrumbs.push({ name: "Course Details", path: path });
    } else if (path.match(/\/reports\/user\/[^/]+$/)) {
      breadcrumbs.push({ name: "Reports", path: "/reports" });
      breadcrumbs.push({ name: "User Details", path: path });
    }
    // Institutes
    else if (path === "/institutes") {
      breadcrumbs.push({ name: "Institutes", path: "/institutes" });
    } else if (path === "/institutes/dashboard") {
      breadcrumbs.push({ name: "Institutes", path: "/institutes" });
      breadcrumbs.push({ name: "Dashboard", path: "/institutes/dashboard" });
    } else if (path.match(/\/institutes\/[^/]+\/analytics$/)) {
      breadcrumbs.push({ name: "Institutes", path: "/institutes" });
      breadcrumbs.push({ name: "Analytics", path: path });
    }
    // Assignment submissions
    else if (path.match(/\/assignment-lesson\/[^/]+\/submissions$/)) {
      breadcrumbs.push({ name: "Courses", path: "/courses" });
      breadcrumbs.push({ name: "Assignment Submissions", path: path });
    }

    // Assignment grading
    else if (path.match(/\/course-overview\/[^/]+\/assignment\/[^/]+\/grade$/)) {
      const slug = params.slug;
      const courseOverviewPath = `/course-overview/${slug}`;
      const assignmentsPath = `/course-overview/${slug}/assignments`;
      breadcrumbs.push({ name: "Course Overview", path: courseOverviewPath });
      breadcrumbs.push({ name: "Assignments", path: assignmentsPath });
      breadcrumbs.push({ name: "Grade Assignment", path: path });
    }
    // Lesson editors
    else if (path.match(/\/(text|video|block|scorm|quiz|assignment|document)-lesson\/[^/]+$/)) {
      const lessonType = path.split('-')[0].substring(1);
      const lessonTypeName = lessonType.charAt(0).toUpperCase() + lessonType.slice(1);
      breadcrumbs.push({ name: "Courses", path: "/courses" });
      breadcrumbs.push({ name: `${lessonTypeName} Lesson Editor`, path: path });
    }
    // Classrooms
    else if (path === "/classrooms") {
      breadcrumbs.push({ name: "Classrooms", path: "/classrooms" });
    } else if (path === "/my-classrooms") {
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
    } else if (path === "/browse-classrooms") {
      breadcrumbs.push({ name: "Browse Classrooms", path: "/browse-classrooms" });
    } else if (path.match(/\/classroom\/[^/]+$/)) {
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/sessions$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/sessions'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Sessions", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/enrollments\/students$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/enrollments'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Student Enrollments", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/enrollments\/teams$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/enrollments'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Team Enrollments", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/session\/[^/]+\/attendance$/)) {
      const parts = path.split('/');
      const classroomId = parts[2];
      const classroomPath = `/classroom/${classroomId}`;
      const attendancePath = `/classroom/${classroomId}/reports/attendance`;
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Attendance Report", path: attendancePath });
      breadcrumbs.push({ name: "Session Attendance", path: path });
    } else if (path.match(/\/sessions\/[^/]+\/attendance$/)) {
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Session Attendance", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/reports\/attendance$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/reports'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Attendance Report", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/reports\/engagement$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/reports'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Engagement Report", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/settings$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/settings'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Settings", path: path });
    } else if (path.match(/\/classrooms\/[^/]+\/live$/)) {
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Live Session", path: path });
    } else if (path.match(/\/classroom\/[^/]+\/recordings$/)) {
      const classroomPath = path.substring(0, path.lastIndexOf('/recordings'));
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Classroom Details", path: classroomPath });
      breadcrumbs.push({ name: "Recordings", path: path });
    } else if (path.match(/\/classrooms\/[^/]+$/) && !path.match(/\/classrooms$/)) {
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Session Details", path: path });
    } else if (path === "/recordings") {
      breadcrumbs.push({ name: "My Classrooms", path: "/my-classrooms" });
      breadcrumbs.push({ name: "Recordings", path: "/recordings" });
    } else if (path.match(/\/teams\/[^/]+\/recordings$/)) {
      const teamPath = path.substring(0, path.lastIndexOf('/recordings'));
      breadcrumbs.push({ name: "Teams", path: "/teams" });
      breadcrumbs.push({ name: "Team Details", path: teamPath });
      breadcrumbs.push({ name: "Recordings", path: path });
    } else if (path.match(/\/teams\/[^/]+\/meeting$/)) {
      const teamPath = path.substring(0, path.lastIndexOf('/meeting'));
      breadcrumbs.push({ name: "Teams", path: "/teams" });
      breadcrumbs.push({ name: "Team Details", path: teamPath });
      breadcrumbs.push({ name: "Meeting", path: path });
    } else if (path.match(/\/teams\/[^/]+\/settings$/)) {
      const teamPath = path.substring(0, path.lastIndexOf('/settings'));
      breadcrumbs.push({ name: "Teams", path: "/teams" });
      breadcrumbs.push({ name: "Team Details", path: teamPath });
      breadcrumbs.push({ name: "Settings", path: path });
    }
    // Student pages
    else if (path === "/my-courses") {
      breadcrumbs.push({ name: "My Courses", path: "/my-courses" });
    } else if (path === "/all-courses") {
      breadcrumbs.push({ name: "All Courses", path: "/all-courses" });
    } else if (path === "/playlists") {
      breadcrumbs.push({ name: "Playlists", path: "/playlists" });
    } else if (path.match(/\/playlists\/[^/]+$/)) {
      breadcrumbs.push({ name: "Playlists", path: "/playlists" });
      breadcrumbs.push({ name: "Playlist Details", path: path });
    } else if (path === "/browse-classrooms") {
      breadcrumbs.push({ name: "Browse Classrooms", path: "/browse-classrooms" });
    } else if (path === "/my-reports") {
      breadcrumbs.push({ name: "My Reports", path: "/my-reports" });
    } else if (path === "/my-teams") {
      breadcrumbs.push({ name: "My Teams", path: "/my-teams" });
    } else if (path === "/my-institute") {
      breadcrumbs.push({ name: "My Institute", path: "/my-institute" });
    } else if (path.match(/\/learn\/[^/]+$/)) {
      breadcrumbs.push({ name: "Courses", path: "/my-courses" });
      breadcrumbs.push({ name: "Learning", path: path });
    } else if (path.match(/\/course-preview\/[^/]+$/)) {
      breadcrumbs.push({ name: "Courses", path: "/all-courses" });
      breadcrumbs.push({ name: "Course Preview", path: path });
    }
    // Other pages
    else if (path === "/certificates") {
      breadcrumbs.push({ name: "Certificate Designer", path: "/certificates" });
    } else if (path === "/events") {
      breadcrumbs.push({ name: "Events", path: "/events" });
    } else if (path === "/settings") {
      breadcrumbs.push({ name: "Settings", path: "/settings" });
    } else if (path === "/earnings") {
      breadcrumbs.push({ name: "Earnings", path: "/earnings" });
    } else if (path === "/dashboard") {
      breadcrumbs.push({ name: "Dashboard", path: "/dashboard" });
    } else if (path === "/achievements") {
      breadcrumbs.push({ name: "Achievements", path: "/achievements" });
    } else if (path === "/leaderboard") {
      breadcrumbs.push({ name: "Leaderboard", path: "/leaderboard" });
    } else if (path === "/profile") {
      breadcrumbs.push({ name: "Profile", path: "/profile" });
    } else if (path === "/profile/settings") {
      breadcrumbs.push({ name: "Profile", path: "/profile" });
      breadcrumbs.push({ name: "Settings", path: "/profile/settings" });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't show breadcrumb on home page or profile pages
  if (location.pathname === "/" || location.pathname === "/profile" || location.pathname === "/profile/settings") {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={14} className="text-gray-400 mx-1" />
          )}
          {index === breadcrumbs.length - 1 ? (
            // Current page - not clickable
            <span className="flex items-center space-x-1 text-orange-600 font-medium">
              {crumb.icon && crumb.icon}
              <span>{crumb.name}</span>
            </span>
          ) : (
            // Clickable breadcrumb
            <Link
              to={crumb.path}
              className="flex items-center space-x-1 hover:text-orange-600 transition-colors duration-200 font-medium"
            >
              {crumb.icon && crumb.icon}
              <span>{crumb.name}</span>
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
