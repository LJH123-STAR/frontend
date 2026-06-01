import axios from 'axios'

// 从环境变量读取后端地址，如果没有则使用默认的 '/api'
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL: baseURL,
  timeout: 30000
})

request.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default request
