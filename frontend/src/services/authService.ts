import axios from 'axios';
import type { RegisterData, LoginData, AuthResponse } from '../types/auth';

const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

export const register = (data: RegisterData) =>
  API.post('/auth/register', data);

export const login = (data: LoginData) =>
  API.post<AuthResponse>('/auth/login', data);

// 🔐 interceptor
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});