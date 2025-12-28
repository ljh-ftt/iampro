import axios from 'axios'

// 获取员工列表
export const getEmployees = (params) => {
  return axios.get('/employees', { params })
}

// 获取单个员工
export const getEmployeeById = (id) => {
  return axios.get(`/employees/${id}`)
}

// 创建员工
export const createEmployee = (data) => {
  return axios.post('/employees', data)
}

// 更新员工
export const updateEmployee = (id, data) => {
  return axios.put(`/employees/${id}`, data)
}

// 删除员工
export const deleteEmployee = (id) => {
  return axios.delete(`/employees/${id}`)
}

// 获取部门列表
export const getDepartments = () => {
  return axios.get('/employees/departments')
}

// 获取岗位列表
export const getPositions = () => {
  return axios.get('/employees/positions')
}