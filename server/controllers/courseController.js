import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import mongoose from "mongoose";

export const deleteCourse = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await Course.findByIdAndDelete(course._id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ 
      published: true,
      accessType: { $ne: 'private' }
    })
      .populate("author", "firstName lastName profilePicture")
      .populate("categories", "name")
      .populate("institute", "name domain")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    const coursesWithInstructor = courses.map(course => {
      const courseObj = course.toObject();
      courseObj.instructor = courseObj.author;
      return courseObj;
    });

    res.json(coursesWithInstructor);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "superadmin") {
      // Superadmin sees all courses
      query = {};
    } else if (req.user.role === "admin") {
      // Admin sees only their institute's courses
      if (req.user.institute) {
        query.institute = req.user.institute;
      }
    } else {
      // Instructors and students see only their courses
      query.author = req.user._id;
    }

    const courses = await Course.find(query)
      .populate("author", "firstName lastName")
      .populate("categories", "name")
      .populate("institute", "name domain")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title, description = "" } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Course title is required" });
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      author: req.user._id,
      createdBy: req.user._id,
      institute: req.user.institute || null,
      department: req.user.department || null,
    });

    await course.save();
    await course.populate("author", "firstName lastName");
    await course.populate("department", "name code");

    res.status(201).json(course);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    console.log('===== getCourseBySlug CALLED =====');
    const { slug } = req.params;
    console.log('Slug:', slug);
    const course = await Course.findOne({ slug })
      .populate("author", "firstName lastName")
      .populate("categories", "name")
      .populate("department", "name code")
      .populate("createdBy", "firstName lastName role")
      .populate("comments.user", "firstName lastName")
      .populate("reviews.user", "firstName lastName")
      .populate("faqs.askedBy", "firstName lastName")
      .populate("faqs.answeredBy", "firstName lastName");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const EnrollmentModel = mongoose.model('Enrollment');
    console.log('Course ID:', course._id);
    const allEnrollments = await EnrollmentModel.find({ course: course._id });
    console.log('All enrollments for course:', allEnrollments.length);
    const activeEnrollments = await EnrollmentModel.find({ course: course._id, isActive: true });
    console.log('Active enrollments:', activeEnrollments.length);
    const enrollmentCount = activeEnrollments.length;
    const courseData = course.toObject();
    courseData.enrollmentCount = enrollmentCount;
    console.log('Sending course data with enrollmentCount:', enrollmentCount, 'reviews:', courseData.reviews?.length);

    res.json(courseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEnrolledCourses = async (req, res) => {
  try {
    console.log('Getting enrolled courses for user:', req.user._id);
    
    const enrollments = await Enrollment.find({
      enrolleeType: "user",
      enrolleeId: req.user._id,
      isActive: true,
    })
      .populate({
        path: "course",
        populate: [
          { path: "author", select: "firstName lastName" },
          { path: "categories", select: "name" },
          { path: "institute", select: "name domain" },
        ],
      })
      .sort({ enrolledAt: -1 });

    console.log(`Found ${enrollments.length} enrollments`);

    const courses = enrollments
      .map((enrollment) => {
        if (!enrollment.course) return null;
        const courseObj = enrollment.course.toObject();
        courseObj.progress = enrollment.progress || 0;
        return courseObj;
      })
      .filter((course) => course !== null);

    console.log(`Returning ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    console.error('Error in getEnrolledCourses:', error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { text } = req.body;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.comments.push({ user: req.user._id, text });
    await course.save();
    await course.populate('comments.user', 'firstName lastName');
    res.json(course.comments[course.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { slug, commentId } = req.params;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.comments = course.comments.filter(c => c._id.toString() !== commentId);
    await course.save();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addReview = async (req, res) => {
  try {
    const { slug } = req.params;
    const { rating, text } = req.body;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const existingReview = course.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.text = text;
    } else {
      course.reviews.push({ user: req.user._id, rating, text });
    }
    await course.save({ validateBeforeSave: false });
    const savedCourse = await Course.findOne({ slug }).populate('reviews.user', 'firstName lastName');
    const userReview = savedCourse.reviews.find(r => r.user._id.toString() === req.user._id.toString());
    res.json(userReview);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addFaq = async (req, res) => {
  try {
    const { slug } = req.params;
    const { question } = req.body;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.faqs.push({ question, askedBy: req.user._id });
    await course.save();
    await course.populate('faqs.askedBy', 'firstName lastName');
    res.json(course.faqs[course.faqs.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const answerFaq = async (req, res) => {
  try {
    const { slug, faqId } = req.params;
    const { answer } = req.body;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const faq = course.faqs.id(faqId);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    faq.answer = answer;
    faq.answeredBy = req.user._id;
    await course.save();
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { slug, faqId } = req.params;
    const course = await Course.findOne({ slug });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.faqs = course.faqs.filter(f => f._id.toString() !== faqId);
    await course.save();
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, description, level, categories, certificateEnabled, certificateTemplate, department } = req.body;

    console.log('Updating course:', slug);
    console.log('Certificate settings:', { certificateEnabled, certificateTemplate });

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (level) updateData.level = level;
    if (department !== undefined) updateData.department = department || null;
    if (certificateEnabled !== undefined) updateData.certificateEnabled = certificateEnabled;
    if (certificateTemplate !== undefined) updateData.certificateTemplate = certificateTemplate;
    if (req.body.published !== undefined) updateData.published = req.body.published;
    if (req.body.featured !== undefined) updateData.featured = req.body.featured;
    if (req.body.allowComments !== undefined) updateData.allowComments = req.body.allowComments;
    if (req.body.enrollmentType) updateData.enrollmentType = req.body.enrollmentType;
    if (req.body.maxStudents !== undefined) updateData.maxStudents = req.body.maxStudents;
    if (req.body.completionCriteria) updateData.completionCriteria = req.body.completionCriteria;
    if (req.body.completionPercentage !== undefined) updateData.completionPercentage = req.body.completionPercentage;
    if (req.body.emailNotifications !== undefined) updateData.emailNotifications = req.body.emailNotifications;
    if (req.body.gradingSystem) updateData.gradingSystem = req.body.gradingSystem;
    if (req.body.passingGrade !== undefined) updateData.passingGrade = req.body.passingGrade;
    if (req.body.autoEnrollInstituteCourses !== undefined) updateData.autoEnrollInstituteCourses = req.body.autoEnrollInstituteCourses;
    if (req.body.accessType) updateData.accessType = req.body.accessType;
    if (req.body.requireApproval !== undefined) updateData.requireApproval = req.body.requireApproval;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (categories) {
      try {
        updateData.categories = typeof categories === "string" ? JSON.parse(categories) : categories;
      } catch (e) {
        return res.status(400).json({ error: "Invalid categories format" });
      }
    }
    if (req.file) {
      updateData.thumbnail = `${req.protocol}://${req.get("host")}/uploads/courses/${req.file.filename}`;
    }

    console.log('Update data:', updateData);

    const course = await Course.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: false }
    )
      .populate("author", "firstName lastName")
      .populate("categories", "name")
      .populate("department", "name code");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    console.log('Course updated successfully:', { certificateEnabled: course.certificateEnabled, certificateTemplate: course.certificateTemplate });

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
