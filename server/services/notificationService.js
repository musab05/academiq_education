const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(recipientId, { type, title, message, link, metadata = {} }) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type,
        title,
        message,
        link,
        metadata
      });
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async notifyEnrollment(userId, courseId, courseTitle) {
    return this.createNotification(userId, {
      type: 'enrollment',
      title: 'New Enrollment',
      message: `You have been enrolled in ${courseTitle}`,
      link: `/learn/${courseId}`,
      metadata: { courseId }
    });
  }

  async notifyAssignmentGraded(userId, assignmentTitle, grade, courseId) {
    return this.createNotification(userId, {
      type: 'grade',
      title: 'Assignment Graded',
      message: `Your assignment "${assignmentTitle}" has been graded: ${grade}`,
      link: `/learn/${courseId}`,
      metadata: { courseId }
    });
  }

  async notifyNewComment(userId, courseTitle, courseSlug) {
    return this.createNotification(userId, {
      type: 'comment',
      title: 'New Comment',
      message: `New comment on ${courseTitle}`,
      link: `/course-preview/${courseSlug}`
    });
  }

  async notifyClassroomSession(userId, classroomTitle, sessionTime, classroomId) {
    return this.createNotification(userId, {
      type: 'classroom',
      title: 'Upcoming Session',
      message: `${classroomTitle} session starting at ${sessionTime}`,
      link: `/classrooms/${classroomId}`,
      metadata: { classroomId }
    });
  }

  async notifyTeamMessage(userId, teamName, senderName, teamId) {
    return this.createNotification(userId, {
      type: 'team',
      title: 'New Team Message',
      message: `${senderName} sent a message in ${teamName}`,
      link: `/teams/${teamId}`,
      metadata: { teamId }
    });
  }

  async notifyAchievement(userId, badgeName, badgeDescription) {
    return this.createNotification(userId, {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You earned the "${badgeName}" badge: ${badgeDescription}`,
      link: '/achievements'
    });
  }
}

module.exports = new NotificationService();
