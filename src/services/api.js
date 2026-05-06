import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Project endpoints
export const projectAPI = {
  create: (data) => API.post('/projects', data),
  getAll: () => API.get('/projects'),
  getById: (id) => API.get(`/projects/${id}`),
  update: (id, data) => API.put(`/projects/${id}`, data),
  addMember: (id, data) => API.post(`/projects/${id}/members`, data),
  removeMember: (id, memberId) => API.delete(`/projects/${id}/members/${memberId}`),
  getStats: (id) => API.get(`/projects/${id}/stats`),
  getActivity: (id, limit) => API.get(`/projects/${id}/activity?limit=${limit || 20}`),
  archive: (id) => API.post(`/projects/${id}/archive`),
};

// Task endpoints
export const taskAPI = {
  create: (projectId, data) => API.post(`/projects/${projectId}/tasks`, data),
  getAll: (projectId, filters) => API.get(`/projects/${projectId}/tasks`, { params: filters }),
  getById: (projectId, id) => API.get(`/projects/${projectId}/tasks/${id}`),
  update: (projectId, id, data) => API.put(`/projects/${projectId}/tasks/${id}`, data),
  updateStatus: (projectId, id, status) =>
    API.patch(`/projects/${projectId}/tasks/${id}/status`, { status }),
  assign: (projectId, id, data) => API.post(`/projects/${projectId}/tasks/${id}/assign`, data),
  unassign: (projectId, id, userId) =>
    API.delete(`/projects/${projectId}/tasks/${id}/assign/${userId}`),
  addComment: (projectId, id, data) => API.post(`/projects/${projectId}/tasks/${id}/comments`, data),
  getDependencies: (projectId, id) =>
    API.get(`/projects/${projectId}/tasks/${id}/dependencies`),
};

// Workload endpoints
export const workloadAPI = {
  updateTeam: (projectId) => API.post(`/workload/${projectId}/update`),
  getRecommendations: (projectId) => API.get(`/workload/${projectId}/recommendations`),
  getUserWorkload: (projectId, userId) => API.get(`/workload/${projectId}/user/${userId}`),
  redistribute: (projectId) => API.post(`/workload/${projectId}/redistribute`),
};

export default API;
