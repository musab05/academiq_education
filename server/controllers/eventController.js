import Event from '../models/Event.js';
import User from '../models/User.js';

export const getEvents = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = { isActive: true };

    // Institute filtering for admins
    if (currentUser.role === 'admin' && currentUser.institute) {
      query.institute = currentUser.institute;
    }

    const events = await Event.find(query)
      .populate('attendees.user', 'firstName lastName email')
      .populate('organizer', 'firstName lastName email')
      .populate('institute', 'name domain')
      .populate('department', 'name code')
      .populate('createdBy', 'firstName lastName')
      .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, type, maxAttendees, organizerId } = req.body;
    const currentUser = req.user;

    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      type,
      maxAttendees: maxAttendees || null,
      organizer: organizerId || currentUser._id,
      createdBy: currentUser._id,
      institute: currentUser.institute || null,
      department: currentUser.department || null,
    });

    await event.save();
    await event.populate('organizer', 'firstName lastName email');
    await event.populate('institute', 'name domain');
    await event.populate('department', 'name code');
    await event.populate('createdBy', 'firstName lastName');

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, startDate, endDate, location, type, status, maxAttendees, organizerId } = req.body;
    const currentUser = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Role-based permissions
    const canEdit = currentUser.role === 'superadmin' ||
                    event.createdBy.toString() === currentUser._id.toString() ||
                    event.organizer.toString() === currentUser._id.toString() ||
                    (currentUser.role === 'admin' && event.institute?.toString() === currentUser.institute?.toString());

    if (!canEdit) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate !== undefined) event.startDate = startDate;
    if (endDate !== undefined) event.endDate = endDate;
    if (location !== undefined) event.location = location;
    if (type !== undefined) event.type = type;
    if (status !== undefined) event.status = status;
    if (maxAttendees !== undefined) event.maxAttendees = maxAttendees || null;
    if (organizerId !== undefined) event.organizer = organizerId;

    await event.save();
    await event.populate('attendees.user', 'firstName lastName email');
    await event.populate('organizer', 'firstName lastName email');
    await event.populate('institute', 'name domain');
    await event.populate('department', 'name code');
    await event.populate('createdBy', 'firstName lastName');

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const currentUser = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Role-based delete permissions
    const canDelete = currentUser.role === 'superadmin' ||
                      event.createdBy.toString() === currentUser._id.toString() ||
                      (currentUser.role === 'admin' && event.institute?.toString() === currentUser.institute?.toString());

    if (!canDelete) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    const currentUser = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const targetUserId = userId || currentUser._id;

    // Check if user already registered
    const existingAttendee = event.attendees.find(a => a.user.toString() === targetUserId.toString());
    if (existingAttendee) {
      return res.status(400).json({ error: 'User already registered for this event' });
    }

    // Check max attendees limit
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }

    event.attendees.push({ user: targetUserId });
    await event.save();
    await event.populate('attendees.user', 'firstName lastName email');

    res.json(event);
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const currentUser = req.user;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const targetUserId = userId || currentUser._id;

    event.attendees = event.attendees.filter(a => a.user.toString() !== targetUserId.toString());
    await event.save();
    await event.populate('attendees.user', 'firstName lastName email');

    res.json(event);
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};