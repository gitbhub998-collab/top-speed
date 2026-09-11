import axios from 'axios';

const normalizeApiUrl = (configuredUrl) => {
  const trimmedUrl = configuredUrl?.trim();
  if (!trimmedUrl) return '';

  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl.replace(/\/+$/, '') || '/';
  }

  const withProtocol = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;
  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '');

  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const configuredApiUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
const API_URL = configuredApiUrl || (import.meta.env.PROD ? '/api' : 'http://localhost:5750/api');

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const systemService = {
  getHealth: () => apiClient.get('/health'),
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export const carService = {
  getAllCars: () => apiClient.get('/cars'),
  getAllCarsIncludingHidden: () => apiClient.get('/cars?includeHidden=true'),
  getCarById: (id) => apiClient.get(`/cars/${id}`),
  createCar: (data) => apiClient.post('/cars', data),
  updateCar: (id, data) => apiClient.put(`/cars/${id}`, data),
  deleteCar: (id) => apiClient.delete(`/cars/${id}`),
  importFromAPI: (brand) => apiClient.post('/cars/admin/import', { brand }),
};

export const modificationService = {
  getModifications: (carId, type) =>
    apiClient.get('/modifications', { params: { carId, type } }),
  createModification: (data) => apiClient.post('/modifications', data),
  updateModification: (id, data) => apiClient.put(`/modifications/${id}`, data),
  deleteModification: (id) => apiClient.delete(`/modifications/${id}`),
};

export const recommendationService = {
  getRecommendations: (preferences) =>
    apiClient.post('/recommendations', preferences),
};

export const configuratorService = {
  calculateConfiguration: (carId, modifications) =>
    apiClient.post('/configurator/calculate', { carId, modifications }),
};

export const authService = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  register: (name, email, password) =>
    apiClient.post('/auth/register', { name, email, password }),
  verifyOTP: (email, otp) =>
    apiClient.post('/auth/verify-otp', { email, otp }),
  resendOTP: (email) =>
    apiClient.post('/auth/resend-otp', { email }),
  updateEmail: (newEmail, password) =>
    apiClient.post('/auth/update-email', { newEmail, password }),
  updateProfile: (profile) => apiClient.patch('/auth/me', profile),
  uploadAvatar: (image) => apiClient.post('/auth/me/avatar', { image }),
  changePassword: (currentPassword, newPassword) =>
    apiClient.post('/auth/change-password', { currentPassword, newPassword }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

export const serviceService = {
  sendModificationRequest: (data) =>
    apiClient.post('/service/send-modification-request', data),
  sendMaintenanceRequest: (data) =>
    apiClient.post('/service/send-maintenance-request', data),
};

