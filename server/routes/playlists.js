import express from 'express';
import { 
  getPlaylists, 
  createPlaylist, 
  updatePlaylist, 
  deletePlaylist, 
  addCourseToPlaylist, 
  removeCourseFromPlaylist,
  getPlaylistById,
  ensureDefaultPlaylist,
  copyPlaylist
} from '../controllers/playlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getPlaylists);
router.get('/default', authenticate, ensureDefaultPlaylist);
router.get('/:playlistId', authenticate, getPlaylistById);
router.post('/', authenticate, createPlaylist);
router.post('/:playlistId/copy', authenticate, copyPlaylist);
router.put('/:playlistId', authenticate, updatePlaylist);
router.delete('/:playlistId', authenticate, deletePlaylist);
router.post('/:playlistId/courses', authenticate, addCourseToPlaylist);
router.delete('/:playlistId/courses/:courseId', authenticate, removeCourseFromPlaylist);

export default router;
