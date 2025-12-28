import axios from 'axios'

// 用户登录
export const login = (phone, password) => {
  return axios.post('/auth/login', { phone, password })
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return axios.get('/auth/me')
}
