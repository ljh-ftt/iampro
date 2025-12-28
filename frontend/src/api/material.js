import axios from 'axios'

// 物资入库
export const addMaterial = (data) => {
  return axios.post('/materials/in', data)
}

// 物资出库
export const issueMaterial = (data) => {
  return axios.post('/materials/out', data)
}

// 申领物资
export const requestMaterial = (data) => {
  return axios.post('/materials/request', data)
}

// 审批物资申领
export const approveMaterialRequest = (data) => {
  return axios.put('/materials/request/approve', data)
}

// 获取物资列表
export const getMaterials = (params) => {
  return axios.get('/materials', { params })
}

// 获取物资申领记录
export const getMaterialRequests = (params) => {
  return axios.get('/materials/requests', { params })
}
