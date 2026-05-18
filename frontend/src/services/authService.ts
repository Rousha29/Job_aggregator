import axios from 'axios';
import type { AxiosRequestHeaders } from 'axios';
import type { RegisterData, LoginData, AuthResponse, UpdateUserData } from '../types/auth';

const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

export const registerUser = (data: RegisterData) =>
  API.post('/auth/register', data);

export const loginUser = (data: LoginData) =>
  API.post<AuthResponse>('/auth/login', data);

export const updateProfile = (data: UpdateUserData) =>
  API.put('/users/me', data);

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    headers.Authorization = `Bearer ${token}`;
    config.headers = headers;
  }
  return config;
});

export default API;