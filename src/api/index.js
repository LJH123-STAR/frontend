import axios from 'axios'

// 临时写死后端地址，确保前后端连通
const baseURL = 'https://my-backend-kzng.onrender.com/api'

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
