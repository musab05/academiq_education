import Notification from '../models/Notification.js';

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const query = { recipient: req.user.id };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('metadata.courseId', 'title')
      .populate('metadata.userId', 'firstName lastName');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNotification = async (recipientId, data) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      ...data
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};
