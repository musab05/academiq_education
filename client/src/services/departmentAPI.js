import api from './api';

export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  createDepartment: (departmentData) => api.post('/departments', departmentData),
  updateDepartment: (id, departmentData) => api.put(`/departments/${id}`, departmentData),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
  addMember: (departmentId, userData) => api.post(`/departments/${departmentId}/members`, userData),
  removeMember: (departmentId, userId) => api.delete(`/departments/${departmentId}/members/${userId}`),
  updateMemberRole: (departmentId, userId, roleData) => api.put(`/departments/${departmentId}/members/${userId}/role`, roleData)
};
