import Playlist from '../models/Playlist.js';

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .populate('courses', 'title slug thumbnail')
      .sort({ isDefault: -1, createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const playlist = new Playlist({
      name,
      description,
      isPublic: isPublic || false,
      user: req.user._id,
    });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description, isPublic } = req.body;
    
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.name = name;
    playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    await playlist.save();
    res.json(playlist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default playlist' });
    }

    await Playlist.findByIdAndDelete(playlistId);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addCourseToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { courseId } = req.body;
    
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.courses.includes(courseId)) {
      return res.status(400).json({ error: 'Course already in playlist' });
    }

    playlist.courses.push(courseId);
    await playlist.save();
    await playlist.populate('courses', 'title slug thumbnail');
    res.json(playlist);
  } catch (error) {
    console.error('Error adding course to playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeCourseFromPlaylist = async (req, res) => {
  try {
    const { playlistId, courseId } = req.params;
    
    const playlist = await Playlist.findOne({ _id: playlistId, user: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.courses = playlist.courses.filter(c => c.toString() !== courseId);
    await playlist.save();
    await playlist.populate('courses', 'title slug thumbnail');
    res.json(playlist);
  } catch (error) {
    console.error('Error removing course from playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId)
      .populate('courses', 'title slug thumbnail description')
      .populate('user', 'firstName lastName');
    
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.isPublic && playlist.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const playlistObj = playlist.toObject();
    playlistObj.isOwner = playlist.user._id.toString() === req.user._id.toString();
    
    res.json(playlistObj);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const copyPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const sourcePlaylist = await Playlist.findById(playlistId);
    
    if (!sourcePlaylist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!sourcePlaylist.isPublic) {
      return res.status(403).json({ error: 'Playlist is not public' });
    }

    if (sourcePlaylist.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot copy your own playlist' });
    }

    const existingCopy = await Playlist.findOne({
      user: req.user._id,
      name: sourcePlaylist.name,
    });

    if (existingCopy) {
      return res.status(400).json({ error: 'You already have a playlist with this name' });
    }

    const newPlaylist = new Playlist({
      name: sourcePlaylist.name,
      description: sourcePlaylist.description,
      user: req.user._id,
      courses: sourcePlaylist.courses,
      isPublic: false,
    });

    await newPlaylist.save();
    await newPlaylist.populate('courses', 'title slug thumbnail');
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error copying playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const ensureDefaultPlaylist = async (req, res) => {
  try {
    let playlist = await Playlist.findOne({ user: req.user._id, isDefault: true });
    
    if (!playlist) {
      playlist = new Playlist({
        name: 'Complete Later',
        description: 'Courses to complete later',
        user: req.user._id,
        isDefault: true,
        isPublic: false,
      });
      await playlist.save();
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error ensuring default playlist:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
