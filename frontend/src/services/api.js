import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ───── Request Interceptor: attach token automatically ─────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ───── Response Interceptor: handle 401 / unauthorized ─────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ───── API Methods ─────

export const loginUser = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await api.post('/login', formData);
  return response.data;
};

export const signupUser = async (username, password, category, location) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('category', category);
  formData.append('location', location);
  const response = await api.post('/signup', formData);
  return response.data;
};

export const getPrediction = async (username) => {
  const formData = new FormData();
  formData.append('username', username);
  const response = await api.post('/predict', formData);
  return response.data;
};

export const getTrends = async (username, range = 'weekly') => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('range', range);
  const response = await api.post('/trends', formData);
  return response.data;
};

export default api;
