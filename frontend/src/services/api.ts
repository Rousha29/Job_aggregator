import axios from 'axios'
import type { AxiosRequestHeaders } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
    baseURL: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        const headers = (config.headers ?? {}) as AxiosRequestHeaders
        headers.Authorization = `Bearer ${token}`
        config.headers = headers
    }
    return config
})

export default api