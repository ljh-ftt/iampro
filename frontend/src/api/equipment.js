import axios from 'axios'

// 获取所有设备
export const getEquipmentList = (category) => {
  const params = category ? { category } : {}
  return axios.get('/equipment', { params })
}

// 获取单个设备
export const getEquipmentById = (id) => {
  return axios.get(`/equipment/${id}`)
}

// 创建设备
export const createEquipment = (equipment) => {
  return axios.post('/equipment', equipment)
}

// 更新设备
export const updateEquipment = (id, equipment) => {
  return axios.put(`/equipment/${id}`, equipment)
}

// 删除设备
export const deleteEquipment = (id) => {
  return axios.delete(`/equipment/${id}`)
}