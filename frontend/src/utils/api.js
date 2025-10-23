import axios from 'axios'

// Use environment variable for API URL in production, fallback to relative path for development
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const { token } = JSON.parse(userInfo)
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
