<template>
  <div class="employee-management-container">
    <van-nav-bar title="员工管理" @click-left="goBack">
      <template #left>
        <van-button type="default" size="small" text>返回</van-button>
      </template>
    </van-nav-bar>
    
    <div class="search-section">
      <van-search
        v-model="searchText"
        placeholder="请输入员工姓名或手机号"
        @search="onSearch"
      />
    </div>
    
    <div style="padding: 10px;">
      <van-button type="primary" block @click="handleAdd">
        新增员工
      </van-button>
    </div>
    
    <van-list
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
      :immediate-check="false"
    >
      <van-cell
        v-for="item in employees"
        :key="item.id"
        :title="item.name"
        :value="item.phone"
      >
        <template #label>
          <div>
            <div>{{ item.name }}</div>
            <div style="font-size: 12px; color: #999;">
              {{ `部门：${item.Department?.name || item.department_id} | 岗位：${item.Position?.name || item.position_id}` }}
            </div>
          </div>
        </template>
        <template #right-icon>
          <van-button type="primary" size="small" @click="handleEdit(item)">
            <van-icon name="edit" style="margin-right: 4px;" />
            编辑
          </van-button>
        </template>
      </van-cell>
    </van-list>
    
    <van-popup v-model="showEditDialog" position="bottom" :style="{ height: '80%' }">
      <div class="edit-dialog-header">
        <h3>{{ editingEmployee ? '编辑员工' : '新增员工' }}</h3>
        <van-icon name="cross" size="24" @click="showEditDialog = false" />
      </div>
      
      <van-form @submit="onSubmitEmployee">
        <van-field
          v-model="employeeForm.name"
          name="name"
          placeholder="请输入员工姓名"
          label="姓名"
          required
          :rules="[{ required: true, message: '请输入员工姓名' }]"
        />
        <van-field
          v-model="employeeForm.phone"
          name="phone"
          placeholder="请输入手机号"
          label="手机号"
          required
          :rules="[{ required: true, message: '请输入手机号' }]"
        />
        <van-field
          v-model="employeeForm.department_name"
          name="department_id"
          placeholder="请选择部门"
          label="部门"
          required
          :rules="[{ required: true, message: '请选择部门' }]"
          readonly
          clickable
          :disabled="editingEmployee"
          @click="!editingEmployee && (showDepartmentPicker = true)"
        />
        <van-field
          v-model="employeeForm.position_name"
          name="position_id"
          placeholder="请选择岗位"
          label="岗位"
          required
          :rules="[{ required: true, message: '请选择岗位' }]"
          readonly
          clickable
          :disabled="editingEmployee"
          @click="!editingEmployee && (showPositionPicker = true)"
        />
        
        <!-- 部门选择器 -->
        <van-popup
          v-model="showDepartmentPicker"
          position="bottom"
          round
          :style="{ height: '80%' }"
        >
          <div class="picker-header">
            <div class="picker-title">选择部门</div>
            <van-button @click="showDepartmentPicker = false" type="default" size="small">关闭</van-button>
          </div>
          <van-cell-group>
            <van-cell
              v-for="department in departments"
              :key="department.id"
              :title="department.name"
              @click="selectDepartment(department)"
              :clickable="true"
            />
          </van-cell-group>
        </van-popup>
        
        <!-- 岗位选择器 -->
        <van-popup
          v-model="showPositionPicker"
          position="bottom"
          round
          :style="{ height: '80%' }"
        >
          <div class="picker-header">
            <div class="picker-title">选择岗位</div>
            <van-button @click="showPositionPicker = false" type="default" size="small">关闭</van-button>
          </div>
          <van-cell-group>
            <van-cell
              v-for="position in positions"
              :key="position.id"
              :title="position.name"
              @click="selectPosition(position)"
              :clickable="true"
            />
          </van-cell-group>
        </van-popup>
        <van-field
          v-if="!editingEmployee"
          v-model="employeeForm.password"
          type="password"
          name="password"
          placeholder="请输入初始密码"
          label="初始密码"
          required
          :rules="[{ required: true, message: '请输入初始密码' }]"
        />
        
        <div style="margin: 24px;">
          <van-button type="primary" block native-type="submit" :loading="employeeLoading">
            {{ editingEmployee ? '更新' : '保存' }}
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script>
import { Toast, Popup, Picker, Icon } from 'vant'
import { getEmployees, createEmployee, updateEmployee, getDepartments, getPositions } from '../api/employee'

export default {
  name: 'EmployeeManagement',
  components: {
    Popup,
    Picker,
    Icon
  },
  data() {
    return {
      searchText: '',
      employees: [],
      loading: false,
      finished: false,
      page: 1,
      
      showEditDialog: false,
      editingEmployee: null,
      employeeForm: {
        name: '',
        phone: '',
        department_id: '',
        department_name: '',
        position_id: '',
        position_name: '',
        password: ''
      },
      employeeLoading: false,
      departments: [],
      positions: [],
      showDepartmentPicker: false,
      showPositionPicker: false
    }
  },
  mounted() {
    this.onLoad()
    this.loadDepartmentsAndPositions()
  },
  methods: {
    async loadDepartmentsAndPositions() {
      try {
        // 并行获取部门和岗位列表
        const [departmentsResponse, positionsResponse] = await Promise.all([
          getDepartments(),
          getPositions()
        ])
        
        this.departments = departmentsResponse.data
        this.positions = positionsResponse.data
      } catch (error) {
        console.error('获取部门和岗位列表失败:', error)
        Toast.fail('获取部门和岗位列表失败')
      }
    },
    async onLoad() {
      try {
        this.loading = true
        // 调用员工列表API
        const response = await getEmployees({ 
          page: this.page, 
          limit: 10, 
          search: this.searchText 
        })
        const data = response.data.employees
        
        this.employees = this.page === 1 ? data : [...this.employees, ...data]
        this.finished = data.length < 10
        this.page++
      } catch (error) {
        console.error(error)
        Toast.fail('获取员工列表失败')
      } finally {
        this.loading = false
      }
    },
    
    onSearch() {
      this.page = 1
      this.finished = false
      this.employees = []
      this.onLoad()
    },
    
    handleAdd() {
      this.editingEmployee = null
      this.resetForm()
      this.showEditDialog = true
    },
    
    handleEdit(employee) {
      this.editingEmployee = employee
      this.employeeForm = {
        id: employee.id,
        name: employee.name,
        phone: employee.phone,
        department_id: employee.department_id,
        department_name: employee.Department?.name || '',
        position_id: employee.position_id,
        position_name: employee.Position?.name || ''
      }
      this.showEditDialog = true
    },
    
    // 处理部门选择
    selectDepartment(department) {
      this.employeeForm.department_id = department.id
      this.employeeForm.department_name = department.name
      this.showDepartmentPicker = false
    },
    
    // 处理岗位选择
    selectPosition(position) {
      this.employeeForm.position_id = position.id
      this.employeeForm.position_name = position.name
      this.showPositionPicker = false
    },
    
    async onSubmitEmployee() {
      try {
        this.employeeLoading = true
        
        if (this.editingEmployee) {
          // 调用更新员工API，只传递必要的字段
          const { id, name, phone, department_id, position_id } = this.employeeForm
          await updateEmployee(id, { name, phone, department_id, position_id })
          Toast.success('员工信息更新成功')
        } else {
          // 调用新增员工API
          await createEmployee(this.employeeForm)
          Toast.success('员工新增成功')
        }
        
        this.showEditDialog = false
        this.resetForm()
        
        // 刷新员工列表
        this.page = 1
        this.finished = false
        this.employees = []
        this.onLoad()
      } catch (error) {
        console.error(error)
        // 显示后端返回的具体错误信息
        const errorMessage = error.response?.data?.message || (this.editingEmployee ? '更新失败' : '新增失败')
        Toast.fail(errorMessage)
      } finally {
        this.employeeLoading = false
      }
    },
    
    resetForm() {
      this.editingEmployee = null
      this.employeeForm = {
        name: '',
        phone: '',
        department_id: '',
        department_name: '',
        position_id: '',
        position_name: '',
        password: ''
      }
    },
    goBack() {
      // 使用更可靠的导航方式，先尝试返回，如果失败则导航到首页
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push('/home')
      }
    }
  }
}
</script>

<style scoped>
.employee-management-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.search-section {
  background-color: #fff;
  padding: 10px;
}

.edit-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.picker-title {
  font-size: 16px;
  font-weight: bold;
}
</style>
