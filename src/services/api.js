import axios from 'axios';

const API = axios.create({
baseURL: 'https://crateline-api-production.up.railway.app',});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Dashboard
export const getDashboard = () => API.get('/dashboard/');

// Products
export const getProducts = (params = {}) => API.get('/products/', { params });
export const createProduct = (data) => API.post('/products/', data);
export const updateProduct = (pid, data) => API.put(`/products/${pid}`, data);
export const deleteProduct = (pid) => API.delete(`/products/${pid}`);

// Categories
export const getCategories = () => API.get('/categories/');
export const createCategory = (data) => API.post('/categories/', data);
export const deleteCategory = (cid) => API.delete(`/categories/${cid}`);

// Stock
export const updateStock = (pid, amount, type) =>
  API.post(`/stock/update?pid=${pid}&amount=${amount}&type=${type}`);
export const getStockLogs = (pid) => API.get(`/stock/logs/${pid}`);

export default API;
