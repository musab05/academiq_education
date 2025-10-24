import api from './api';

export const userAPI = {
  getUsers: (role = '') => api.get(`/users${role ? `?role=${role}` : ''}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Profile management
  getCurrentProfile: () => api.get('/users/profile/me'),
  updateProfile: (profileData) => api.put('/users/profile/me', profileData),
  changePassword: (passwordData) => api.put('/users/profile/password', passwordData),
  updateProfilePicture: (pictureData) => api.put('/users/profile/picture', pictureData),
  resetProfilePicture: () => api.post('/users/profile/picture/reset')
};
