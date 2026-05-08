import axios from 'axios';
import type { RegisterData, LoginData, AuthResponse } from '../types/auth';

const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

export const registerUser = (data: RegisterData) =>
  API.post('/auth/register', data);

export const loginUser = (data: LoginData) =>
  API.post<AuthResponse>('/auth/login', data);

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;