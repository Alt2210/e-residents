import axios from 'axios';

const api = axios.create({
  // Lấy URL từ file .env.local (ví dụ: http://localhost:3001)
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStatistics = async () => {
  const response = await api.get('/statistics');
  return response.data;
};

// Tự động thêm Token vào Header nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;