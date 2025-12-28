import axios from 'axios'

// 创建报修记录
export const createRepairRequest = (data, files) => {
  const formData = new FormData()
  formData.append('equipment_id', data.equipment_id)
  formData.append('fault_description', data.fault_description)
  
  // 添加图片文件
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('images', file)
    })
  }
  
  return axios.post('/repair-requests', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取报修记录列表
export const getRepairRequests = (params) => {
  return axios.get('/repair-requests', { params })
}

// 获取单个报修记录
export const getRepairRequestById = (id) => {
  return axios.get(`/repair-requests/${id}`)
}

// 更新报修记录状态
export const updateRepairRequestStatus = (id, status) => {
  return axios.put(`/repair-requests/${id}/status`, { status })
}

// 创建维修记录
export const createRepairRecord = (data, files) => {
  const formData = new FormData()
  formData.append('repair_request_id', data.repair_request_id)
  formData.append('status', data.status)
  if (data.solution_description) {
    formData.append('solution_description', data.solution_description)
  }
  if (data.transfer_note) {
    formData.append('transfer_note', data.transfer_note)
  }
  if (data.work_personnel) {
    formData.append('work_personnel', data.work_personnel)
  }
  if (data.shift_processing_log) {
    formData.append('shift_processing_log', data.shift_processing_log)
  }
  
  // 添加图片文件
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('images', file)
    })
  }
  
  return axios.post('/repair-records', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取维修记录列表
export const getRepairRecords = () => {
  return axios.get('/repair-records')
}

// 获取单个维修记录
export const getRepairRecordById = (id) => {
  return axios.get(`/repair-records/${id}`)
}
